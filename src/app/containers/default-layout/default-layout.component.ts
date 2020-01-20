import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { setLanguage } from '../../shared/shared.module';
import { AuthService } from '../../services/auth.service';
import { CookieService } from '../../services/cookie.service';

/**
 * @ignore
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent implements OnInit {
  logos = {
    okm: {
      fi: {
        src: 'assets/img/logos/okm-fi.jpg',
        alt: 'Opetus- ja kulttuuriministeriö',
      },
      en: {
        src: 'assets/img/logos/okm-en.jpg',
        alt: 'Ministry of Education and Culture',
      },
      sv: {
        src: 'assets/img/logos/okm-sv.jpg',
        alt: 'Undervisnings- och kulturministeriet',
      },
    },
    oph: {
      fi: {
        src: 'assets/img/logos/oph-fisv.png',
        alt: 'Opetushallitus',
      },
      en: {
        src: 'assets/img/logos/oph-en.png',
        alt: 'Finnish National Agency for Education',
      },
      sv: {
        src: 'assets/img/logos/oph-fisv.png',
        alt: 'Utbildningsstyrelsen',
      },
    },
  };

  showNotice = true;
  alertClosed = false;

  constructor(
    public translate: TranslateService,
    public authSvc: AuthService,
    private cookieSvc: CookieService,
  ) {
    this.showNotice = !this.cookieSvc.isCookieSettingsSet();
  }

  ngOnInit(): void {
    this.alertClosed = sessionStorage.getItem('aoe.alertClosed201')
      ? JSON.parse(sessionStorage.getItem('aoe.alertClosed201')).closed
      : false;
  }

  /**
   * Set language
   */
  public changeLanguage(lang: string): void {
    setLanguage(lang);
    this.translate.use(lang);
  }

  private hideCookieNotice(): void {
    this.showNotice = false;
  }

  closeAlert(): void {
    sessionStorage.setItem('aoe.alertClosed201', JSON.stringify({ closed: true }));
    this.alertClosed = true;
  }
}
