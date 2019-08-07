import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { getAcceptance, getUsername } from '../shared/shared.module';

@Injectable({
  providedIn: 'root'
})
export class AcceptanceGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (getUsername() && getAcceptance() && getAcceptance().toLowerCase() === 'true') {
      return true;
    }

    this.router.navigate(['/hyvaksynta']);
    return false;
  }

}
