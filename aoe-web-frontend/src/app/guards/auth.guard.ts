import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router'
import { Observable } from 'rxjs'
import { AuthService } from '@services/auth.service'

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Checks if authenticated user exists.
   * AuthGuard is executed before navigating to the target URL.
   * The user information is verified from the session storage if not available in service state.
   * @param {ActivatedRouteSnapshot} _next
   * @param {RouterStateSnapshot} _state
   * @returns {Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree}
   */
  canActivate(
    _next: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.hasUserData() || sessionStorage.getItem('userData')) {
      return true
    }
    void this.router.navigate(['/etusivu'])
    return false
  }
}
