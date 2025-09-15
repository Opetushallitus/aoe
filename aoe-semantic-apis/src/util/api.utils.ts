import { HttpHeaders } from '../models/httpheaders'
import { winstonLogger } from '../util'

export async function getDataFromApi(
  api: string,
  route?: string,
  headers?: HttpHeaders,
  params?: string
): Promise<any> {
  try {
    const options = {
      url: `${api}${route}${params}`,
      headers: headers
    }
    const response = await fetch(options.url, {
      headers: {
        Accept: headers.Accept,
        ...(!!headers?.['Caller-Id'] ? { 'Caller-Id': headers['Caller-Id'] } : {})
      }
    })

    if (headers.Accept === 'application/json') {
      return await response.json()
    } else {
      return response.text()
    }
  } catch (err) {
    winstonLogger.error(`Error getting data from ${api}: %o`, err)
  }
}
