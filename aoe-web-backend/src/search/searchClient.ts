import { defaultProvider } from '@aws-sdk/credential-provider-node'
import { Client } from '@opensearch-project/opensearch'
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws-v3'

/**
 * OpenSearch client for the AOE search indices.
 *
 * In AWS the collection is OpenSearch Serverless ("aoss"), which only accepts SigV4-signed
 * requests, so signRequests must be true there. Locally and in CI OpenSearch runs unsecured
 * in Docker and requests go out unsigned.
 */
export const createSearchClient = (signRequests: boolean): Client => {
  if (!signRequests) {
    return new Client({ node: process.env.ES_NODE })
  }
  // AWS SDK v3 default chain: on ECS this resolves the task role from the container
  // credentials endpoint. The provider memoizes and re-fetches shortly before expiry.
  const credentials = defaultProvider()
  return new Client({
    ...AwsSigv4Signer({
      region: process.env.AWS_REGION || 'eu-west-1',
      service: 'aoss',
      getCredentials: () => credentials()
    }),
    node: process.env.ES_NODE
  })
}
