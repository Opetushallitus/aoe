import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Injectable()
export class CredentialInterceptor implements HttpInterceptor {
  constructor(
    private authSvc: AuthService,
  ) { }

  intercept (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.authSvc.sessionIsLogged()) {
      req = req.clone({
        withCredentials: true,
      });
    }

    return next.handle(req);
  }
}
