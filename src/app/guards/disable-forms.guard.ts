import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertService } from '@services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class DisableFormsGuard implements CanActivate {
  constructor (
    private router: Router,
    private alertSvc: AlertService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.alertSvc.disableForms()) {
      return this.router.parseUrl('/etusivu');
    }

    return true;
  }
}
