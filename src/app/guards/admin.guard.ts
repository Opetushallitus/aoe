import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AdminService } from '@services/admin.service';
import { map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor (
    private router: Router,
    private adminSvc: AdminService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.adminSvc.getAdminStatus().pipe(
      map((response: HttpResponse<string>) => {
        if (response.status !== 200) {
          return this.router.parseUrl('/404');
        }

        return true;
      }),
    );
  }
}
