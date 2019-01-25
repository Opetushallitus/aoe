import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { getLanguage, setLanguage } from './shared/shared.module';

@Component({
  // tslint:disable-next-line
  selector: 'body',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private translate: TranslateService
  ) {
    translate.addLangs(['fi', 'en', 'sv']);
    translate.setDefaultLang('fi');

    const lang = getLanguage();

    if (lang === undefined) {
      const browserLang = translate.getBrowserLang();

      setLanguage(browserLang.match(/fi|en|sv/) ? browserLang : 'fi');
      translate.use(browserLang);
    } else {
      translate.use(lang);
    }
  }

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }
}
