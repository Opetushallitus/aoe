import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router'
import { Observable } from 'rxjs'
import { AdminService } from '@services/admin.service'
import { map } from 'rxjs/operators'
import { HttpResponse } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class AdminGuard {
  constructor(
    private router: Router,
    private adminService: AdminService
  ) {}

  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.adminService.getAdminStatus().pipe(
      map((response: HttpResponse<string>): UrlTree | boolean => {
        if (response.status !== 200) {
          void this.router.parseUrl('/404')
          return false
        }
        return true
      })
    )
  }
}
