import { Component, OnInit, ViewEncapsulation } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { TranslateService } from '@ngx-translate/core'
import { KoodistoService } from './services/koodisto.service'
import { AuthService } from '@services/auth.service'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { CollapseDirective } from 'ngx-bootstrap/collapse'

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, CollapseDirective]
})
export class AdminComponent implements OnInit {
  isNavbarCollapsed = true
  constructor(
    private authService: AuthService,
    private titleSvc: Title,
    private translate: TranslateService,
    public koodistoService: KoodistoService
  ) {}

  ngOnInit(): void {
    this.authService.updateUserData().subscribe()
    this.translate.get('common.serviceName').subscribe((serviceName: string) => {
      this.titleSvc.setTitle(`Bryssel - ${serviceName}`)
    })
  }
}
