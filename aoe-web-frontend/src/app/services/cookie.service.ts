import { Injectable } from '@angular/core'
@Injectable({
  providedIn: 'root'
})
export class CookieService {
  constructor() {}
  cookiePolicyAccepted: boolean = false

  /**
   * Checks if cookie policy has been accepted.
   * @returns {boolean}
   */
  isCookiePolicyAccepted(): boolean {
    try {
      return (
        sessionStorage.getItem('cookiePolicy') === 'accepted' || this.cookiePolicyAccepted === true
      )
    } catch (e) {
      return this.cookiePolicyAccepted
    }
  }

  /**
   * Checks if browser has sessionStorage and saves cookie policy acceptance.
   *
   */
  acceptCookiePolicy(): void {
    let support = false
    try {
      sessionStorage.setItem('test', 'true')
      if (
        typeof window.sessionStorage !== 'undefined' &&
        sessionStorage.getItem('test') === 'true'
      ) {
        support = true
      }
      sessionStorage.removeItem('test')
    } catch (e) {
      support = false
      console.log(e)
    }

    if (support) {
      sessionStorage.setItem('cookiePolicy', 'accepted')
      this.cookiePolicyAccepted = true
    } else {
      this.cookiePolicyAccepted = true
    }
  }
}
