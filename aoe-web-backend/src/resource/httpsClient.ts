import { IncomingMessage, RequestOptions } from 'http'
import https from 'https'
import http from 'http'

import * as log from '@util/winstonLogger'

/**
 * HTTP(S) client to execute internal request to other service components.
 * Request options specified and provided as an argument.
 *
 * @param httpsConnection use https or http
 * @param options http.RequestOptions
 */
export const httpsClient = (httpsConnection: boolean, options: RequestOptions): Promise<any> => {
  return new Promise((resolve, reject) => {
    let request = (httpsConnection ? https : http).request(options, (response: IncomingMessage) => {
      let output = ''
      response
        .setEncoding('utf8')
        .on('data', (chunk) => {
          output += chunk
        })
        .on('end', () => {
          try {
            let obj
            if (response.headers['content-type'].includes('json')) {
              obj = JSON.parse(output)
            } else {
              obj = output
            }
            resolve({
              statusCode: response.statusCode,
              data: obj
            })
          } catch (error) {
            reject(error)
          }
        })
        .on('error', () => {
          response.destroy()
        })
    })
    request
      .on('error', (err: Error) => {
        log.error(`Request handling failed in HTTPS client`, err)
        reject(err)
      })
      .on('timeout', () => {
        log.debug(`Request timeout in HTTPS client: ${options.timeout} ms`)
      })
      .end()
  })
}
