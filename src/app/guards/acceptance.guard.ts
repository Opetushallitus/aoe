import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '@services/auth.service';
import { UserData } from '@models/userdata';

@Injectable({
    providedIn: 'root',
})
export class AcceptanceGuard implements CanActivate {
    constructor(private router: Router, private authSvc: AuthService) {}

    /**
     * Checks if logged in user has accepted terms of use.
     * @param {ActivatedRouteSnapshot} _next
     * @param {RouterStateSnapshot} _state
     * @returns {Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree}
     */
    canActivate(
        _next: ActivatedRouteSnapshot,
        _state: RouterStateSnapshot,
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const user: UserData = this.authSvc.getUserData();

        if (!user || user?.termsofusage === true) {
            return true;
        }

        // redirect to acceptance route.
        return this.router.parseUrl('/hyvaksynta');
    }
}
