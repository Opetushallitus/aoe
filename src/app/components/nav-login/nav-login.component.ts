import { Component, OnInit } from '@angular/core';

import { AuthService } from '@services/auth.service';
import { Observable } from 'rxjs';
import { UserData } from '@models/userdata';

@Component({
    selector: 'app-nav-login',
    templateUrl: './nav-login.component.html',
})
export class NavLoginComponent implements OnInit {
    userData$: Observable<UserData>;

    constructor(public authSvc: AuthService) {}

    ngOnInit(): void {
        this.userData$ = this.authSvc.userData$.asObservable();
    }

    login(): void {
        this.authSvc.login();
    }

    logout(): void {
        this.authSvc.logout();
    }
}
