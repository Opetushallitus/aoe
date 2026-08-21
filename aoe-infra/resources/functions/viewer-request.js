import cf from 'cloudfront'

const COOKIE_NAME = 'aoe_auth_token'

const BACKEND_PREFIXES = []

const response401 = {
  statusCode: 401,
  statusDescription: 'Unauthorized',
  headers: {
    'www-authenticate': { value: 'Basic' }
  }
}

async function getSecret(key) {
  try {
    const kvsHandle = cf.kvs()
    return await kvsHandle.get(key)
  } catch (err) {
    return null
  }
}

async function validateBasicAuth(authHeader) {
  if (!authHeader) {
    return false
  }

  const match = authHeader.match(/^Basic (.+)$/)
  if (!match) {
    return false
  }

  const username = await getSecret('username')
  const password = await getSecret('password')

  const credentials = Buffer.from(match[1], 'base64').toString('utf-8').split(':', 2)
  return credentials[0] === username && credentials[1] === password
}

async function validateAuthToken(token) {
  if (!token) return false

  const username = await getSecret('username')
  const tokensecret = await getSecret('tokensecret')

  const decoded = Buffer.from(token, 'base64').toString('utf-8')
  const parts = decoded.split(':')
  const tokenUsername = parts[0]
  const secret = parts[1]
  return tokenUsername === username && secret === tokensecret
}

async function authorize(request) {
  const headers = request.headers

  if (!(await getSecret('username'))) {
    return null
  }

  if (request.uri === '/meta/oaipmh' || request.uri === '/meta/v2/oaipmh') {
    return null
  }

  if (request.uri === '/api/secure/redirect' || request.uri === '/') {
    const referer = headers.referer && headers.referer.value

    if (referer === (await getSecret('referer'))) {
      return null
    }
  }

  const cookie = request.cookies[COOKIE_NAME]
  if (cookie && (await validateAuthToken(cookie.value))) {
    return null
  }

  const authHeader = headers.authorization && headers.authorization.value
  if (!(await validateBasicAuth(authHeader))) {
    return response401
  }

  // If Basic Auth succeeds, proceed with the request
  // (A viewer-response function will set the cookie)
  return null
}

function isBackendPath(uri) {
  return BACKEND_PREFIXES.some((prefix) => uri.startsWith(prefix))
}

// Keyed on the bucket layout rather than on file extensions, because a route segment can end in
// something extension-shaped: /materiaali/:id/:versionDate carries an ISO timestamp.
const STATIC_DIRECTORIES = ['/assets/', '/i18n/', '/media/']
const ROOT_FILE = /^\/[^/]+\.[^/]+$/

function isStaticAsset(uri) {
  return STATIC_DIRECTORIES.some((prefix) => uri.startsWith(prefix)) || ROOT_FILE.test(uri)
}

async function handler(event) {
  const request = event.request

  const denied = await authorize(request)
  if (denied) {
    return denied
  }

  if (!isBackendPath(request.uri) && !isStaticAsset(request.uri)) {
    request.uri = '/index.html'
  }

  return request
}
