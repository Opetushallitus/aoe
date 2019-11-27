import { Injectable } from '@angular/core';
import { CookieService as CookieSvc } from 'ngx-cookie-service';
import { CookieSettings } from '../models/cookie-settings';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  constructor(
    private cookieService: CookieSvc,
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

    // save settings to session storage
    sessionStorage.setItem('aoe.cookies', JSON.stringify(cookieSettings));

    // delete Google Analytics cookies
    if (values.googleAnalytics === false && this.cookieService.check('_ga')) {
      this.cookieService.delete('_ga');
    }
  }

  /**
   * Get cookie setting.
   * @param {string} cookie
   * @returns {boolean}
   */
  getCookieSetting(cookie: string): boolean {
    const cookieSettings: CookieSettings = JSON.parse(sessionStorage.getItem('aoe.cookies'));

    return cookieSettings[cookie];
  }

  /**
   * Checks if cookie settings are set.
   * @returns {boolean}
   */
  isCookieSettingsSet(): boolean {
    return !!sessionStorage.getItem('aoe.cookies');
  }
}
