import { Injectable } from '@angular/core';

import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() { }

  public setUser(username: string, firstname: string, lastname: string, acceptance: boolean): void {
    const user: User = {
      username: username,
      firstname: firstname,
      lastname: lastname,
      acceptance: acceptance,
    };

    localStorage.setItem('aoe.user', JSON.stringify(user));
  }

  public getUser(): User | null {
    return JSON.parse(localStorage.getItem('aoe.user'));
  }

  public removeUser(): void {
    localStorage.removeItem('aoe.user');
  }

  public updateAcceptance(value: boolean): void {
    const user: User = this.getUser();

    user.acceptance = value;

    localStorage.setItem('aoe.user', JSON.stringify(user));
  }

  public isLogged() {
    return !!this.getUser();
  }
}
