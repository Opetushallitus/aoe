import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { setLanguage } from '../../shared/shared.module';
import { AuthService } from '@services/auth.service';
import { CookieService } from '@services/cookie.service';

/**
 * @ignore
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent {
  languages = new Map();

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

  brand = {
    fi: {
      alt: 'Avointen oppimateriaalien kirjasto',
    },
    en: {
      alt: 'Library of Open Educational Resources',
    },
    sv: {
      alt: 'Biblioteket för öppna lärresurser',
    },
  };

  showNotice = true;
  showMaintenanceAlert = true;

  constructor(
    public translate: TranslateService,
    public authSvc: AuthService,
    private cookieSvc: CookieService,
  ) {
    this.showNotice = !this.cookieSvc.isCookieSettingsSet();

    this.languages.set('fi', {
      label: 'FI',
      srText: 'Suomi: Vaihda kieli suomeksi',
    });

    this.languages.set('en', {
      label: 'EN',
      srText: 'English: Change language to English',
    });

    this.languages.set('sv', {
      label: 'SV',
      srText: 'Svenska: Byt språk till svenska',
    });
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
