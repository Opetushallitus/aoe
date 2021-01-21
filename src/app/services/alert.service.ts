import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AlertsResponse } from '@models/alerts/alerts-response';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  constructor(
    private http: HttpClient,
  ) { }

  /**
   * Handles errors.
   * @param {HttpErrorResponse} error
   * @private
   */
  private handleError(error: HttpErrorResponse) {
    return throwError('Something bad happened; please try again later.');
  }

  updateAlerts(): Observable<AlertsResponse> {
    return this.http.get<AlertsResponse>(
      `${environment.backendUrl}/messages/info`,
      ).pipe(
        map((response: AlertsResponse) => {
          if (response.allas.enabled === '1') {
            sessionStorage.setItem(environment.disableForms, JSON.stringify(true));
          } else {
            delete response.allas;
            sessionStorage.setItem(environment.disableForms, JSON.stringify(false));
          }

          if (response.login.enabled === '1') {
            sessionStorage.setItem(environment.disableLogin, JSON.stringify(true));
          } else {
            delete response.login;
            sessionStorage.setItem(environment.disableLogin, JSON.stringify(false));
          }

          return response;
        }),
      catchError(this.handleError),
    );
  }

  disableForms(): boolean {
    return JSON.parse(sessionStorage.getItem(environment.disableForms));
  }

  disableLogin(): boolean {
    return JSON.parse(sessionStorage.getItem(environment.disableLogin));
  }
}
