import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { User } from '../models/user';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AcceptanceGuard implements CanActivate {
  constructor(
    private router: Router,
    private authSvc: AuthService,
  ) { }

  /**
   * Checks if logged in user has accepted terms of use.
   * @param {ActivatedRouteSnapshot} next
   * @param {RouterStateSnapshot} state
   * @returns {Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree}
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const user: User = this.authSvc.getUser();

    if (!user || (user && user.acceptance === true)) {
      return true;
    }

    // redirect to acceptance route.
    this.router.navigate(['/hyvaksynta']);
    return false;
  }

}
