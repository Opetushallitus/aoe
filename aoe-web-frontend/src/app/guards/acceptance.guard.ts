import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '@services/auth.service';
import { UserData } from '@models/userdata';

@Injectable({
  providedIn: 'root',
})
export class AcceptanceGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

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
    const userData: UserData = this.authService.getUserData();

    if (!userData || userData?.termsofusage === true) {
      return true;
    }
    // Redirect to the acceptance of Terms of Use.
    return this.router.parseUrl('/hyvaksynta');
  }
}
