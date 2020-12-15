import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Userdata } from '@models/userdata';
import { CookieService } from 'ngx-cookie-service';
import { UserSettings } from '@models/users/user-settings';
import { UpdateUserSettingsResponse } from '@models/users/update-user-settings-response';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Toast } from '@models/translations/toast';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loggedOutToast: Toast;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient,
    private cookieSvc: CookieService,
    private router: Router,
    private toastr: ToastrService,
    private translate: TranslateService,
  ) {
    this.translate.get('session.toasts.loggedOut').subscribe((translation: Toast) => {
      this.loggedOutToast = translation;
    });
  }

  /**
   * Handles errors.
   * @param {HttpErrorResponse} error
   * @private
   */
  private handleError(error: HttpErrorResponse) {
    console.error(error);

    return throwError('Something bad happened; please try again later.');
  }

  /**
   * Redirects user to login page.
   */
  login(): void {
    this.document.location.href = `${environment.backendUrl}/login`;
  }

  /**
   * Retrieves user data from backend.
   * @returns {Observable<Userdata>}
   */
  setUserdata(): Observable<Userdata> {
    return this.http.get<Userdata>(`${environment.backendUrl}/userdata`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).pipe(
      map((res: Userdata): Userdata => {
        const expires = new Date();
        expires.setTime(expires.getTime() + environment.sessionMaxAge);

        this.cookieSvc.set(environment.userdataKey, JSON.stringify(res), expires);

        return res;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && this.hasUserdata()) {
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
    return this.hasUserdata() ? JSON.parse(this.cookieSvc.get(environment.userdataKey)) : null;
  }

  /**
   * Checks if user data exists.
   * @returns {boolean}
   */
  hasUserdata(): boolean {
    return this.cookieSvc.check(environment.userdataKey);
  }

  /**
   * Removes user data and session id cookie.
   */
  removeUserdata(): void {
    // remove user data
    this.cookieSvc.delete(environment.userdataKey);

    // remove session id
    this.cookieSvc.delete('connect.sid', '/');

    // show toast
    this.toastr.info(this.loggedOutToast.title);
  }

  /**
   * Updates acceptance.
   * @returns {Observable<string>}
   */
  updateAcceptance(): void {
    this.http.put<any>(`${environment.backendUrl}/termsofusage`, null).subscribe(
      () => this.removeUserdata(),
      (err) => console.error(err),
      () => {
        this.setUserdata().subscribe();
        this.router.navigate(['/etusivu']);
      },
    );
  }

  /**
   * Removes user data and redirects user to logout endpoint.
   */
  logout(): void {
    this.removeUserdata();

    this.document.location.href = `${environment.backendUrl}/logout`;
  }

  /**
   * Updates user settings.
   * @param {UserSettings} userSettings
   * @returns {Observable<UpdateUserSettingsResponse>}
   */
  updateUserSettings(userSettings: UserSettings): Observable<UpdateUserSettingsResponse> {
    return this.http.put<UpdateUserSettingsResponse>(`${environment.backendUrl}/updateSettings`, userSettings, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).pipe(
      catchError(this.handleError),
    );
  }

  hasEmail(): boolean {
    return !!this.getUserdata()?.email;
  }

  hasVerifiedEmail(): boolean {
    return this.getUserdata()?.verifiedEmail;
  }
}
