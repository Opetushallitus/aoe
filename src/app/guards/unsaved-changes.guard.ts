import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<ComponentCanDeactivate> {
  canDeactivate(
    component: ComponentCanDeactivate,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const currentPath = currentState.url.substring(1).split('/').slice(0, -1);
    const nextPath = nextState.url.substring(1).split('/').slice(0, -1);

    // console.log(JSON.stringify(currentPath) === JSON.stringify(nextPath));
    // console.log(currentPath);
    // console.log(nextPath);

    return JSON.stringify(currentPath) !== JSON.stringify(nextPath)
      ? component.canDeactivate()
      : true;
  }
}
