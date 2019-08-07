import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';

import { getLanguage, getUsername, setLanguage, setUsername } from './shared/shared.module';

@Component({
  // tslint:disable-next-line
  selector: 'body',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private translate: TranslateService,
    @Inject(DOCUMENT) doc: Document,
    private renderer: Renderer2
  ) {
    translate.addLangs(['fi', 'en', 'sv']);
    translate.setDefaultLang('fi');

    const lang = getLanguage();

    if (lang === null) {
      const browserLang = translate.getBrowserLang();

      setLanguage(browserLang.match(/fi|en|sv/) ? browserLang : 'fi');
      translate.use(browserLang);
    } else {
      translate.use(lang);
    }

    translate.onLangChange.subscribe((event: LangChangeEvent) => {
      renderer.setAttribute(doc.documentElement, 'lang', event.lang);
    });

    // Google Analytics
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        (<any>window).gtag('config', 'UA-135550416-1', { 'page_path': event.urlAfterRedirects });
      }
    });

    setUsername('kalle.lehtonen@digia.com');

    if (getUsername()) {
      console.log('logged in');
    } else {
      console.log('not logged in');
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
