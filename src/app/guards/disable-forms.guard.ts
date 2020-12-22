import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertService } from '@services/alert.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class DisableFormsGuard implements CanActivate {
  constructor (
    private router: Router,
    private alertSvc: AlertService,
    private toastr: ToastrService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.alertSvc.disableForms()) {
      this.toastr.warning('Uusien oppimateriaalien ja tiedostojen lisääminen on estetty palvelussa olevan virhetilanteen selvittämisen ajaksi');

      return this.router.parseUrl('/etusivu');
    }

    return true;
  }
}
