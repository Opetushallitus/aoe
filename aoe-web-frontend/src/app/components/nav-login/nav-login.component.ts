import { Component } from '@angular/core'
import { AuthService } from '@services/auth.service'
import { FocusRemoverDirective } from '../../directives/focus-remover.directive';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-nav-login',
    templateUrl: './nav-login.component.html',
    imports: [FocusRemoverDirective, RouterLink, RouterLinkActive, AsyncPipe, TranslatePipe]
})
export class NavLoginComponent {
  constructor(public authService: AuthService) {}

  login(): void {
    this.authService.login()
  }

  logout(): void {
    this.authService.logout()
  }
}
