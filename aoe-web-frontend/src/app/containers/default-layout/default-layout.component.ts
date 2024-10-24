import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { setLanguage } from '../../shared/shared.module';
import { AuthService } from '@services/auth.service';
import { CookieService } from '@services/cookie.service';
import { interval, Observable } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { AlertService } from '@services/alert.service';
import { AlertsResponse } from '@models/alerts/alerts-response';
import { ServiceNotification } from '@models/service-notification';
import { NotificationService } from '@services/notification.service';

/**
 * @ignore
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
})
export class DefaultLayoutComponent implements OnInit {
  languages = new Map();
  alerts: AlertsResponse;
  serviceNotifications$: Observable<ServiceNotification[]> = this.notificationService.notifications$;

  // Check if the site has been embedded and needs to be blocked due to suspicious activity.
  // window !== window.top : true => The site is in a frame.
  embedded: boolean = window !== window.top;

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
      img: 'assets/img/aoe_logo_fi_45.png',
      alt: 'Avointen oppimateriaalien kirjasto',
    },
    en: {
      img: 'assets/img/aoe_logo_en_45.png',
      alt: 'Library of Open Educational Resources',
    },
    sv: {
      img: 'assets/img/aoe_logo_sv_45.png',
      alt: 'Biblioteket för öppna lärresurser',
    },
  };

  showNotice = true;

  constructor(
    public translate: TranslateService,
    public authService: AuthService,
    private cookieSvc: CookieService,
    private alertSvc: AlertService,
    private notificationService: NotificationService,
  ) {
    this.showNotice = !this.cookieSvc.isCookiePolicyAccepted();

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
    this.notificationService.getActiveNotifications();

    interval(5 * 60 * 1000) // minutes x seconds x milliseconds
      .pipe(
        startWith(0),
        switchMap(() => this.alertSvc.updateAlerts()),
      )
      .subscribe((response: AlertsResponse) => (this.alerts = response));
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
