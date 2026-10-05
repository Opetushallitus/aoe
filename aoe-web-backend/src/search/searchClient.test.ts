import { after, afterEach, before, beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { createSearchClient } from './searchClient.ts'

// Every AWS variable the SDK v3 default credential chain reads. Each test starts from a clean
// slate so a developer's own profile or SSO session can never leak into a signature.
const awsEnvKeys = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_SESSION_TOKEN',
  'AWS_PROFILE',
  'AWS_REGION',
  'AWS_CONFIG_FILE',
  'AWS_SHARED_CREDENTIALS_FILE',
  'AWS_WEB_IDENTITY_TOKEN_FILE',
  'AWS_ROLE_ARN',
  'AWS_CONTAINER_CREDENTIALS_FULL_URI',
  'AWS_CONTAINER_CREDENTIALS_RELATIVE_URI',
  'AWS_CONTAINER_AUTHORIZATION_TOKEN',
  'AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE',
  'AWS_EC2_METADATA_DISABLED',
  'ES_NODE'
]

const listen = (server: http.Server): Promise<string> =>
  new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve(`http://127.0.0.1:${(server.address() as AddressInfo).port}`)
    })
  })

const close = (server: http.Server): Promise<void> =>
  new Promise((resolve) => {
    server.closeAllConnections()
    server.close(() => resolve())
  })

describe('createSearchClient', () => {
  const savedEnv: Record<string, string | undefined> = {}

  // Stands in for OpenSearch: records the headers of every request it receives.
  const searchRequests: http.IncomingHttpHeaders[] = []
  const searchServer = http.createServer((req, res) => {
    searchRequests.push(req.headers)
    req.resume()
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end('{}')
  })

  // Stands in for the ECS container credentials endpoint: hands out the queued responses in order.
  const credentialResponses: object[] = []
  const credentialServer = http.createServer((_req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify(credentialResponses.shift()))
  })

  let searchUrl: string
  let credentialUrl: string

  before(async () => {
    searchUrl = await listen(searchServer)
    credentialUrl = await listen(credentialServer)
  })

  after(async () => {
    await close(searchServer)
    await close(credentialServer)
  })

  beforeEach(() => {
    for (const key of awsEnvKeys) {
      savedEnv[key] = process.env[key]
      delete process.env[key]
    }
    // Point the shared config files at nothing so ~/.aws is never read.
    process.env.AWS_CONFIG_FILE = '/nonexistent/aws-config'
    process.env.AWS_SHARED_CREDENTIALS_FILE = '/nonexistent/aws-credentials'
    process.env.AWS_EC2_METADATA_DISABLED = 'true'
    process.env.ES_NODE = searchUrl
    searchRequests.length = 0
    credentialResponses.length = 0
  })

  afterEach(() => {
    for (const key of awsEnvKeys) {
      if (savedEnv[key] === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = savedEnv[key]
      }
    }
  })

  it('sends unsigned requests when signing is off, as the local and CI stacks expect', async () => {
    const client = createSearchClient(false)
    await client.ping()
    await client.close()

    assert.equal(searchRequests.length, 1)
    assert.equal(searchRequests[0].authorization, undefined)
  })

  it('signs requests for OpenSearch Serverless with credentials from the SDK v3 default chain', async () => {
    process.env.AWS_ACCESS_KEY_ID = 'AKIDFROMENV'
    process.env.AWS_SECRET_ACCESS_KEY = 'secret-from-env'
    process.env.AWS_SESSION_TOKEN = 'token-from-env'

    const client = createSearchClient(true)
    await client.ping()
    await client.close()

    assert.equal(searchRequests.length, 1)
    assert.match(
      searchRequests[0].authorization ?? '',
      /^AWS4-HMAC-SHA256 Credential=AKIDFROMENV\/\d{8}\/eu-west-1\/aoss\/aws4_request, /
    )
    assert.equal(searchRequests[0]['x-amz-security-token'], 'token-from-env')
  })

  it('signs for AWS_REGION when it is set', async () => {
    process.env.AWS_ACCESS_KEY_ID = 'AKIDFROMENV'
    process.env.AWS_SECRET_ACCESS_KEY = 'secret-from-env'
    process.env.AWS_REGION = 'eu-north-1'

    const client = createSearchClient(true)
    await client.ping()
    await client.close()

    assert.match(searchRequests[0].authorization ?? '', /\/eu-north-1\/aoss\/aws4_request, /)
  })

  // This is the ECS path: task-role credentials come from the container endpoint and expire.
  // A client that kept signing with the first set would start getting 403s hours after a deploy.
  it('signs with fresh task-role credentials once the previous ones have expired', async (t) => {
    const deployedAt = new Date('2026-01-01T00:00:00Z').getTime()
    const hours = 60 * 60 * 1000
    // Only the clock is faked; sockets and their timers stay real.
    t.mock.timers.enable({ apis: ['Date'], now: deployedAt })
    process.env.AWS_CONTAINER_CREDENTIALS_FULL_URI = `${credentialUrl}/task-credentials`
    credentialResponses.push(
      {
        AccessKeyId: 'AKIDFIRST',
        SecretAccessKey: 'first-secret',
        Token: 'first-token',
        Expiration: new Date(deployedAt + 6 * hours).toISOString()
      },
      {
        AccessKeyId: 'AKIDSECOND',
        SecretAccessKey: 'second-secret',
        Token: 'second-token',
        Expiration: new Date(deployedAt + 12 * hours).toISOString()
      }
    )

    const client = createSearchClient(true)
    await client.ping()
    await client.ping()
    t.mock.timers.setTime(deployedAt + 7 * hours)
    await client.ping()
    await client.close()

    const signedWith = searchRequests.map(
      (headers) => /Credential=([^/]+)\//.exec(headers.authorization ?? '')?.[1]
    )
    assert.deepEqual(signedWith, ['AKIDFIRST', 'AKIDFIRST', 'AKIDSECOND'])
    assert.equal(searchRequests[2]['x-amz-security-token'], 'second-token')
  })

  it('rejects the request instead of sending it unsigned when no credentials can be found', async () => {
    const client = createSearchClient(true)
    await assert.rejects(client.ping())
    await client.close()

    assert.equal(searchRequests.length, 0)
  })
})
