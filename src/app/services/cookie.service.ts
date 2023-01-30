import { Injectable } from '@angular/core';
import { CookieService as CookieSvc } from 'ngx-cookie-service';
import { CookieSettings } from '@models/cookie-settings';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CookieService {
    constructor(private cookieSvc: CookieSvc) {}
    cookiePolicyAccepted: boolean = false;

    /**
     * Set cookie settings.
     * @param values
     */
    setCookieSettings(values: { aoe: boolean; googleAnalytics: boolean }): void {
        const cookieSettings: CookieSettings = {
            aoe: true,
            googleAnalytics: values.googleAnalytics,
        };
        this.cookieSvc.set(environment.cookieSettingsCookie, JSON.stringify(cookieSettings), 30);

        // Delete Google Analytics cookies
        if (values.googleAnalytics === false && this.cookieSvc.check('_ga')) {
            this.cookieSvc.delete('_ga');
        }
    }

    /**
     * Get cookie setting.
     * @param {string} cookie
     * @returns {boolean}
     */
    getCookieSetting(cookie: string): boolean {
        const cookieSettings: CookieSettings = JSON.parse(this.cookieSvc.get(environment.cookieSettingsCookie));
        return cookieSettings[cookie];
    }

    /**
     * Checks if cookie settings are set.
     * @returns {boolean}
     */
    isCookieSettingsSet(): boolean {
        return this.cookieSvc.check(environment.cookieSettingsCookie);
    }

    /**
     * Checks if cookie policy has been accepted.
     * @returns {boolean}
     */
    isCookiePolicyAccepted(): boolean {
        try {
            return sessionStorage.getItem('acceptedCookies') === 'true' || this.cookiePolicyAccepted === true;
        } catch( e ) {
            return this.cookiePolicyAccepted;
        }
        
    }
    
    /**
     * Checks if browser has sessionStorage and saves cookie policy acceptance.
     * 
     */
    acceptCookiePolicy(): void {
        let support = false;
        try {
            sessionStorage.setItem('test','true');
            if (typeof window.sessionStorage !== "undefined" && sessionStorage.getItem('test') === 'true') {
                support = true;
            }
            sessionStorage.removeItem('test');
          }
          catch( e ) {
            support = false;
            console.log( e );
        }

        if (support) {
            sessionStorage.setItem('acceptedCookies','true');
            this.cookiePolicyAccepted = true;
        } else {
            this.cookiePolicyAccepted = true;
        }
    }
}
