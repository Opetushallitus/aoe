import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { UserData } from '@models/userdata';
import { CookieService } from 'ngx-cookie-service';
import { UserSettings } from '@models/users/user-settings';
import { UpdateUserSettingsResponse } from '@models/users/update-user-settings-response';
import { Router } from '@angular/router';
import { AlertService } from '@services/alert.service';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(
        @Inject(DOCUMENT) private document: Document,
        private http: HttpClient,
        private cookieSvc: CookieService,
        private router: Router,
        private alertSvc: AlertService,
    ) {}

    public userData$ = new BehaviorSubject<UserData>(null);

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
                    console.log('Update userdata: ', this.userData$.getValue());
                    this.userData$.next(userData);
                    // const expires = new Date();
                    // expires.setTime(expires.getTime() + environment.sessionMaxAge);
                    // this.cookieSvc.set(environment.userdataKey, JSON.stringify(userData), expires);
                },
                (error) => {
                    if (error.status === 401 && this.userData$.getValue()) {
                        this.removeUserData().then();
                    } else {
                        console.error('Error in updateUserData(): ', error);
                    }
                },
            );
    }

    /**
     * Returns user data.
     * @returns {UserData}
     */
    getUserData(): UserData {
        console.log('Get userdata: ', this.userData$.getValue());
        return this.userData$.getValue();
        // return this.hasUserdata() ? JSON.parse(this.cookieSvc.get(environment.userdataKey)) : null;
    }

    /**
     * Checks if user data exists.
     * @returns {boolean}
     */
    hasUserData(): boolean {
        return !!this.userData$.getValue();
        // return this.cookieSvc.check(environment.userdataKey);
    }

    /**
     * Removes user data and session id cookie.
     */
    async removeUserData(): Promise<void> {
        this.userData$.next(null);
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
                this.router.navigate(['/etusivu']).then();
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
                this.router.navigate(['/logout']).then(() => {
                    console.log('Navigated to /logout');
                });
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
        return !!this.userData$.getValue()?.email;
        // return !!this.userData$?.email;
    }

    hasVerifiedEmail(): boolean {
        return this.userData$.getValue()?.verifiedEmail;
    }
}
