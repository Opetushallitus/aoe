import { Component, OnInit, ViewEncapsulation } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { environment } from '../../environments/environment'
import { KoodistoService } from './services/koodisto.service'
import { AuthService } from '@services/auth.service'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, RouterLinkActive, RouterOutlet]
})
export class AdminComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private titleSvc: Title,
    public koodistoService: KoodistoService
  ) {}

  ngOnInit(): void {
    this.authService.updateUserData().subscribe()
    this.titleSvc.setTitle(`Bryssel ${environment.title}`)
  }
}
