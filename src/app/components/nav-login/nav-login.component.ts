import { Component, OnInit } from '@angular/core';

import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav-login',
  templateUrl: './nav-login.component.html',
})
export class NavLoginComponent implements OnInit {
  public isLoggedIn: boolean;
  public user: User;

  constructor(private authSvc: AuthService) { }

  ngOnInit() {
    this.isLoggedIn = this.authSvc.isLogged();

    if (this.isLoggedIn) {
      this.user = this.authSvc.getUser();
    }
  }

  public login(): void {
    this.authSvc.setUser('maija.mehilainen@aoe.fi', 'Maija', 'Mehiläinen', false);
    this.isLoggedIn = true;
    this.user = this.authSvc.getUser();
  }

  public logout(): void {
    this.authSvc.removeUser();
    this.isLoggedIn = false;
  }
}
