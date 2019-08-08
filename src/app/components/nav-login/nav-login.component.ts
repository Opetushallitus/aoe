import { Component, OnInit } from '@angular/core';

import { User } from '../../models/user';
import { getUser, isLoggedIn, removeUser, setUser } from '../../shared/shared.module';

@Component({
  selector: 'app-nav-login',
  templateUrl: './nav-login.component.html',
})
export class NavLoginComponent implements OnInit {
  public isLoggedIn: boolean;
  public user: User;

  constructor() { }

  ngOnInit() {
    this.isLoggedIn = isLoggedIn;

    if (this.isLoggedIn) {
      this.user = getUser();
    }
  }

  public login(): void {
    setUser('maija.mehilainen@aoe.fi', 'Maija', 'Mehiläinen', false);
    this.isLoggedIn = true;
  }

  public logout(): void {
    removeUser();
    this.isLoggedIn = false;
  }
}
