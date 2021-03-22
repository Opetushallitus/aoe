import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { setLanguage } from '../../shared/shared.module';
import { AuthService } from '@services/auth.service';
import { CookieService } from '@services/cookie.service';
import { interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { AlertService } from '@services/alert.service';
import { AlertsResponse } from '@models/alerts/alerts-response';

/**
 * @ignore
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent implements OnInit {
  languages = new Map();
  alerts: AlertsResponse;

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
      img: 'assets/img/aoe_logo_fi.png',
      alt: 'Avointen oppimateriaalien kirjasto',
    },
    en: {
      img: 'assets/img/aoe_logo_en.png',
      alt: 'Library of Open Educational Resources',
    },
    sv: {
      img: 'assets/img/aoe_logo_sv.png',
      alt: 'Biblioteket för öppna lärresurser',
    },
  };

  showNotice = true;
  showMaintenanceAlert = true;

  constructor(
    public translate: TranslateService,
    public authSvc: AuthService,
    private cookieSvc: CookieService,
    private alertSvc: AlertService,
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

  ngOnInit(): void {
    interval(5 * 60 * 1000) // minutes x seconds x milliseconds
      .pipe(
        startWith(0),
        switchMap(() => this.alertSvc.updateAlerts())
      )
      .subscribe((response: AlertsResponse) => this.alerts = response);
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
