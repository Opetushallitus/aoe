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
  hasUserdata: boolean;
  langs: string[];

  constructor(
    private translate: TranslateService,
    private authSvc: AuthService,
    private cookieSvc: CookieService,
  ) { }

  ngOnInit(): void {
    this.showNotice = !this.cookieSvc.isCookieSettingsSet();
    this.hasUserdata = this.authSvc.hasUserdata();
    this.langs = this.translate.getLangs();
  }

  /**
   * Set language
   */
  changeLanguage(lang: string): void {
    setLanguage(lang);
    this.translate.use(lang);
  }

  hideCookieNotice(): void {
    this.showNotice = false;
  }
}
