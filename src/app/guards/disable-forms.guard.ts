import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertService } from '@services/alert.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class DisableFormsGuard implements CanActivate {
  constructor (
    private router: Router,
    private alertSvc: AlertService,
    private toastr: ToastrService,
    private translate: TranslateService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.alertSvc.disableForms()) {
      this.toastr.warning(this.translate.instant('errors.toasts.disableForms').message);

      return this.router.parseUrl('/etusivu');
    }

    return true;
  }
}
