import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav-login',
  templateUrl: './nav-login.component.html',
})
export class NavLoginComponent implements OnInit {
  hasUserdata: boolean;

  constructor(
    private authSvc: AuthService,
  ) { }

  ngOnInit(): void {
    this.hasUserdata = this.authSvc.hasUserdata();
  }

  login(): void {
    this.authSvc.login();
  }

  logout(): void {
    this.authSvc.logout();
  }
}
