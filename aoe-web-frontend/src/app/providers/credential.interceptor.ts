import { Injectable } from '@angular/core'
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http'
import { Observable } from 'rxjs'

import { AuthService } from '@services/auth.service'
import { environment } from '../../environments/environment'

@Injectable()
export class CredentialInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (environment.production === false) {
      if (
        (req.url.includes('userdata') || this.authService.hasUserData()) &&
        (req.url.includes(environment.backendUrl) || req.url.includes(environment.backendUrlV2))
      ) {
        req = req.clone({
          withCredentials: true
        })
      }
    }

    return next.handle(req)
  }
}
