import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

import { environment } from '../../environments/environment';
import { Userdata } from '../models/userdata';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  backendUrl = environment.backendUrl;
  sessionCookie = environment.sessionCookie;
  userdataKey = environment.userdataKey;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private cookieSvc: CookieService,
    private http: HttpClient,
  ) { }

  /**
   * Redirects user to login page.
   */
  login(): void {
    this.document.location.href = `${this.backendUrl}/login`;
  }

  /**
   * Checks if session cookie is set.
   * @returns {boolean}
   */
  isLogged(): boolean {
    return this.cookieSvc.check(this.sessionCookie);
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
   * Updates acceptance.
   * @param {boolean} acceptance
   */
  updateAcceptance(acceptance: boolean): void {
    // @todo: call backend
  }

  /**
   * Removes session cookie and user data.
   */
  logout(): void {
    // delete cookie
    this.cookieSvc.delete(this.sessionCookie);

    // delete userdata
    sessionStorage.removeItem(this.userdataKey);
  }
}
