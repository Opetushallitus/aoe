import { Injectable } from '@angular/core';
import { CookieService as CookieSvc } from 'ngx-cookie-service';
import { CookieSettings } from '../models/cookie-settings';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  constructor(
    private cookieSvc: CookieSvc,
  ) { }

  /**
   * Set cookie settings.
   * @param values
   */
  setCookieSettings(values): void {
    const cookieSettings: CookieSettings = {
      aoe: true,
      googleAnalytics: values.googleAnalytics,
    };

    this.cookieSvc.set(
      environment.cookieSettingsCookie,
      JSON.stringify(cookieSettings),
      30,
    );

    // delete Google Analytics cookies
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
}
