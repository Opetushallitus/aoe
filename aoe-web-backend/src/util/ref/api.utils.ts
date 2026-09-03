import { HttpHeaders } from '@/models/ref/httpheaders'
import * as winstonLogger from '@util/winstonLogger'

export async function getDataFromApi(
  api: string,
  route?: string,
  headers?: HttpHeaders,
  params?: string
): Promise<any> {
  const url = `${api}${route}${params}`

  try {
    const response = await fetch(url, {
      headers: {
        Accept: headers.Accept,
        ...(!!headers?.['Caller-Id'] ? { 'Caller-Id': headers['Caller-Id'] } : {})
      }
    })

    if (!response.ok) {
      // Release the connection: an unread body keeps its socket checked out until GC.
      await response.body?.cancel()
      winstonLogger.error(
        'Error getting data from %s: responded with HTTP %s %s',
        url,
        response.status,
        response.statusText
      )
      return undefined
    }

    // A 2xx is not a guarantee of a body: ePerusteet answers 204 for a resource that
    // exists in a listing but is not available at the requested route.
    const body = await response.text()

    if (!body) {
      winstonLogger.error(
        'Error getting data from %s: responded with HTTP %s and an empty body',
        url,
        response.status
      )
      return undefined
    }

    if (headers.Accept === 'application/json') {
      try {
        return JSON.parse(body)
      } catch (err) {
        winstonLogger.error('Error getting data from %s: response is not valid JSON: %o', url, err)
        return undefined
      }
    }

    return body
  } catch (err) {
    winstonLogger.error('Error getting data from %s: %o', url, err)
    return undefined
  }
}
