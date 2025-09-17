import { Inject, Injectable } from '@angular/core'
import { DOCUMENT } from '@angular/common'
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http'
import { BehaviorSubject, Observable, of, throwError } from 'rxjs'
import { catchError, map, tap } from 'rxjs/operators'
import { environment } from '@environments/environment'
import { UserData } from '@models/userdata'
import { UserSettings } from '@models/users/user-settings'
import { UpdateUserSettingsResponse } from '@models/users/update-user-settings-response'
import { Router } from '@angular/router'
import { AlertService } from '@services/alert.service'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userDataBehaviorSubject$$: BehaviorSubject<UserData> = new BehaviorSubject<UserData>(null)

  public userData$: Observable<UserData> = this.userDataBehaviorSubject$$.asObservable()

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient,
    private router: Router,
    private alertService: AlertService
  ) {}

  /**
   * Handles errors.
   * @param {HttpErrorResponse} error
   * @private
   */
  private handleError(error: HttpErrorResponse) {
    console.error(error)
    return throwError('Something bad happened; please try again later.')
  }

  /**
   * Redirects user to login page.
   */
  login(): void {
    if (!this.alertService.disableLogin()) {
      this.document.location.href = `${environment.loginUrl}/login`
    }
  }

  /**
   * Request up-to-date user's information and update the state of userData$.
   * @returns {void}
   */
  updateUserData(): Observable<UserData> {
    return this.http
      .get<UserData>(`${environment.backendUrl}/userdata`, {
        headers: new HttpHeaders({
          Accept: 'application/json'
        })
      })
      .pipe(
        map((userData: UserData) => userData),
        tap((userData: UserData): void => {
          this.userDataBehaviorSubject$$.next(userData)
          sessionStorage.setItem('userData', JSON.stringify(userData))
        }),
        catchError((err) => of(err))
      )
  }

  /**
   * Returns user data.
   * @returns {UserData}
   */
  getUserData(): UserData {
    return this.userDataBehaviorSubject$$.getValue()
  }

  /**
   * Checks if user data exists.
   * @returns {boolean}
   */
  hasUserData(): boolean {
    return this.userDataBehaviorSubject$$.getValue() !== null
  }

  /**
   * Removes user data and session id cookie.
   */
  async removeUserData(): Promise<void> {
    this.userDataBehaviorSubject$$.next(null)
    sessionStorage.removeItem('userData')
  }

  /**
   * Updates acceptance.
   * @returns {Observable<string>}
   */
  updateAcceptance(): void {
    this.http.put<any>(`${environment.backendUrl}/termsofusage`, null).subscribe(
      () => this.removeUserData(),
      (err) => console.error(err),
      (): void => {
        this.updateUserData().subscribe()
        void this.router.navigate(['/etusivu'])
      }
    )
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
            Accept: 'application/json'
          })
        }
      )
      .subscribe(async (): Promise<void> => {
        await this.removeUserData()
        void this.router.navigate(['/logout'])
      })
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
          Accept: 'application/json'
        })
      })
      .pipe(catchError(this.handleError))
  }

  hasEmail(): boolean {
    return !!this.userDataBehaviorSubject$$.getValue()?.email
  }

  hasVerifiedEmail(): boolean {
    return this.userDataBehaviorSubject$$.getValue()?.verifiedEmail
  }
}
