import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { UserData } from '@models/userdata';
import { UserSettings } from '@models/users/user-settings';
import { UpdateUserSettingsResponse } from '@models/users/update-user-settings-response';
import { Router } from '@angular/router';
import { AlertService } from '@services/alert.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userDataBehaviorSubject$$: BehaviorSubject<UserData> = new BehaviorSubject<UserData>(null);

  public userData$: Observable<UserData> = this.userDataBehaviorSubject$$.asObservable();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient,
    private router: Router,
    private alertSvc: AlertService,
  ) {}

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
    if (!this.alertSvc.disableLogin()) {
      this.document.location.href = `${environment.loginUrl}/login`;
    }
  }

  /**
   * Request up-to-date user's information and update the state of userData$.
   * @returns {void}
   */
  updateUserData(): void {
    this.http
      .get<UserData>(`${environment.backendUrl}/userdata`, {
        headers: new HttpHeaders({
          Accept: 'application/json',
        }),
      })
      .subscribe(
        (userData: UserData) => {
          this.userDataBehaviorSubject$$.next(userData);
          // const expires = new Date();
          // expires.setTime(expires.getTime() + environment.sessionMaxAge);
          // this.cookieSvc.set(environment.userdataKey, JSON.stringify(userData), expires);
        },
        (error) => {
          // Remove user's information if the session is not valid anymore.
          if (error.status === 401 && this.userDataBehaviorSubject$$.getValue()) {
            this.removeUserData().then();
          }
        },
      );
  }

  /**
   * Returns user data.
   * @returns {UserData}
   */
  getUserData(): UserData {
    return this.userDataBehaviorSubject$$.getValue();
    // return this.hasUserdata() ? JSON.parse(this.cookieSvc.get(environment.userdataKey)) : null;
  }

  /**
   * Checks if user data exists.
   * @returns {boolean}
   */
  hasUserData(): boolean {
    return !!this.userDataBehaviorSubject$$.getValue();
    // return this.cookieSvc.check(environment.userdataKey);
  }

  /**
   * Removes user data and session id cookie.
   */
  async removeUserData(): Promise<void> {
    this.userDataBehaviorSubject$$.next(null);
    // this.cookieSvc.delete(environment.userdataKey);
    return;
    // remove session id
    // this.cookieSvc.delete('connect.sid');
  }

  /**
   * Updates acceptance.
   * @returns {Observable<string>}
   */
  updateAcceptance(): void {
    this.http.put<any>(`${environment.backendUrl}/termsofusage`, null).subscribe(
      () => this.removeUserData(),
      (err) => console.error(err),
      () => {
        this.updateUserData();
        void this.router.navigate(['/etusivu']);
      },
    );
  }

  /**
   * Removes user data and redirects user to front page.
   */
  logout(): void {
    this.http
      .post(
        `${environment.loginUrl}/logout`,
        {},
        {
          headers: new HttpHeaders({
            Accept: 'application/json',
          }),
        },
      )
      .subscribe(async () => {
        await this.removeUserData();
        void this.router.navigate(['/logout']);
      });
  }

  /**
   * Updates user settings.
   * @param {UserSettings} userSettings
   * @returns {Observable<UpdateUserSettingsResponse>}
   */
  updateUserSettings(userSettings: UserSettings): Observable<UpdateUserSettingsResponse> {
    return this.http
      .put<UpdateUserSettingsResponse>(`${environment.backendUrl}/updateSettings`, userSettings, {
        headers: new HttpHeaders({
          Accept: 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  hasEmail(): boolean {
    return !!this.userDataBehaviorSubject$$.getValue()?.email;
    // return !!this.userData$?.email;
  }

  hasVerifiedEmail(): boolean {
    return this.userDataBehaviorSubject$$.getValue()?.verifiedEmail;
  }
}
