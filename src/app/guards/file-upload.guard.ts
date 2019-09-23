import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadGuard implements CanActivate {
  private localStorageKey = environment.fileUploadLSKey;

  constructor(private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const tabId = +next.paramMap.get('tabId');

    if (tabId > 1 && localStorage.getItem(this.localStorageKey) === null) {
      this.router.navigate(['/lisaa-oppimateriaali', 1]);
      return false;
    } else {
      return true;
    }
  }
}
