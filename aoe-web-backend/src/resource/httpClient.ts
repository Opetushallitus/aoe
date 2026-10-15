import { z } from 'zod'

const request = async (
  url: string,
  accept: string,
  headers: Record<string, string>
): Promise<Response> => {
  const response = await fetch(url, {
    headers: { Accept: accept, ...headers },
    signal: AbortSignal.timeout(60_000)
  })

  if (!response.ok) {
    // Release the connection: an unread body keeps its socket checked out until GC.
    await response.body?.cancel()
    throw new Error(
      `Error getting data from ${url}: responded with HTTP ${response.status} ${response.statusText}`
    )
  }

  return response
}

export const fetchJson = async <T>(
  url: string,
  schema: z.ZodType<T>,
  headers: Record<string, string> = {}
): Promise<T> => {
  const response = await request(url, 'application/json', headers)
  const data: unknown = await response.json()
  const parsed = schema.safeParse(data)

  if (!parsed.success) {
    throw new Error(`Unusable data from ${url}: ${z.prettifyError(parsed.error)}`)
  }

  return parsed.data
}

export const fetchStream = async (
  url: string,
  accept: string,
  headers: Record<string, string> = {}
): Promise<ReadableStream<Uint8Array>> => {
  const response = await request(url, accept, headers)

  if (!response.body) {
    throw new Error(`Error getting data from ${url}: responded without a body`)
  }

  return response.body
}
