import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Userdata } from '@models/userdata';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  backendUrl = environment.backendUrl;
  userdataKey = environment.userdataKey;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient,
    private cookieSvc: CookieService,
  ) { }

  /**
   * Redirects user to login page.
   */
  login(): void {
    this.document.location.href = `${this.backendUrl}/login`;
  }

  /**
   * Retrieves user data from backend.
   * @returns {Observable<Userdata>}
   */
  setUserdata(): Observable<Userdata> {
    return this.http.get<Userdata>(`${this.backendUrl}/userdata`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).pipe(
      map((res): Userdata => {
        sessionStorage.setItem(this.userdataKey, JSON.stringify(res));

        return res;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.removeUserdata();
        }

        return throwError('Something bad happened; please try again later.');
      }),
    );
  }

  /**
   * Returns user data.
   * @returns {Userdata}
   */
  getUserdata(): Userdata {
    return JSON.parse(sessionStorage.getItem(this.userdataKey));
  }

  /**
   * Checks if user data exists.
   * @returns {boolean}
   */
  hasUserdata(): boolean {
    return !!this.getUserdata();
  }

  /**
   * Removes user data and session id cookie.
   */
  removeUserdata(): void {
    // remove user data
    sessionStorage.removeItem(this.userdataKey);

    // remove session id
    this.cookieSvc.delete('connect.sid', '/');
  }

  /**
   * Updates acceptance.
   * @returns {Observable<string>}
   */
  updateAcceptance(): Observable<string> {
    const userdata = this.getUserdata();
    userdata.termsofusage = true;

    sessionStorage.setItem(this.userdataKey, JSON.stringify(userdata));

    return this.http.put<any>(`${this.backendUrl}/termsofusage`, null);
  }

  /**
   * Removes user data and redirects user to logout endpoint.
   */
  logout(): void {
    this.removeUserdata();

    this.document.location.href = `${this.backendUrl}/logout`;
  }
}
