import { Component } from '@angular/core'
import { AuthService } from '@services/auth.service'

@Component({
  selector: 'app-nav-login',
  templateUrl: './nav-login.component.html',
  standalone: false
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
