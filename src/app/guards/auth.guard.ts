import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '@services/auth.service';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    /**
     * Checks if user is logged in.
     * @param {ActivatedRouteSnapshot} _next
     * @param {RouterStateSnapshot} _state
     * @returns {Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree}
     */
    canActivate(
        _next: ActivatedRouteSnapshot,
        _state: RouterStateSnapshot,
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (!this.authService.hasUserData()) {
            return this.router.parseUrl('/etusivu');
        } else {
            return true;
        }
    }
}
