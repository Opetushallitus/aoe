import { Component } from '@angular/core';

import { AuthService } from '@services/auth.service';

@Component({
    selector: 'app-nav-login',
    templateUrl: './nav-login.component.html',
})
export class NavLoginComponent {
    constructor(public authSvc: AuthService) {}

    login(): void {
        this.authSvc.login();
    }

    logout(): void {
        this.authSvc.logout();
    }
}
