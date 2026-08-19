import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { urls } from '@constants/urls'
import { storageKeys } from '@constants/storage-keys'
import { AlertsResponse } from '@models/alerts/alerts-response'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  constructor(private http: HttpClient) {}

  /**
   * Handles errors.
   * @param {HttpErrorResponse} _error
   * @private
   */
  private handleError(_error: HttpErrorResponse): Observable<never> {
    return throwError('Something bad happened; please try again later.')
  }

  updateAlerts(): Observable<AlertsResponse> {
    return this.http.get<AlertsResponse>(`${urls.backendUrl}/messages/info`).pipe(
      map((response: AlertsResponse) => {
        if (response.allas.enabled === '1') {
          sessionStorage.setItem(storageKeys.disableForms, JSON.stringify(true))
        } else {
          delete response.allas
          sessionStorage.setItem(storageKeys.disableForms, JSON.stringify(false))
        }

        if (response.login.enabled === '1') {
          sessionStorage.setItem(storageKeys.disableLogin, JSON.stringify(true))
        } else {
          delete response.login
          sessionStorage.setItem(storageKeys.disableLogin, JSON.stringify(false))
        }

        return response
      }),
      catchError(this.handleError)
    )
  }

  disableForms(): boolean {
    return JSON.parse(sessionStorage.getItem(storageKeys.disableForms))
  }

  disableLogin(): boolean {
    return JSON.parse(sessionStorage.getItem(storageKeys.disableLogin))
  }
}
