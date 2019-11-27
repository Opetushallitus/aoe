import { Injectable } from '@angular/core';

import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() { }

  /**
   * Saves user details to localStorage.
   * @param {string} username
   * @param {string} firstname
   * @param {string} lastname
   * @param {boolean} acceptance
   */
  public setUser(username: string, firstname: string, lastname: string, acceptance: boolean): void {
    const user: User = {
      username: username,
      firstname: firstname,
      lastname: lastname,
      acceptance: acceptance,
    };

    localStorage.setItem('aoe.user', JSON.stringify(user));
  }

  /**
   * Returns user details from localStorage.
   * @returns {User | null}
   */
  public getUser(): User | null {
    return JSON.parse(localStorage.getItem('aoe.user'));
  }

  /**
   * Removes user details from localStorage.
   */
  public removeUser(): void {
    localStorage.removeItem('aoe.user');
  }

  /**
   * Updates acceptance value in user details.
   * @param {boolean} value
   */
  public updateAcceptance(value: boolean): void {
    const user: User = this.getUser();

    user.acceptance = value;

    localStorage.setItem('aoe.user', JSON.stringify(user));
  }

  /**
   * Returns boolean for user login status.
   * @returns {boolean}
   */
  public isLogged(): boolean {
    return !!this.getUser();
  }
}
