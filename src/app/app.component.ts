import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';

import { getLanguage, setLanguage } from './shared/shared.module';
import { CookieService } from '@services/cookie.service';
import { AuthService } from '@services/auth.service';
import { Subscription } from 'rxjs';
import { UserData } from '@models/userdata';

@Component({
    // tslint:disable-next-line
    selector: 'body',
    template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnDestroy, OnInit {
    userData: UserData;
    userDataSubscription: Subscription;

    constructor(
        private router: Router,
        private translate: TranslateService,
        @Inject(DOCUMENT) doc: Document,
        private renderer: Renderer2,
        private cookieSvc: CookieService,
        private authSvc: AuthService,
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

        if (this.cookieSvc.isCookieSettingsSet() && this.cookieSvc.getCookieSetting('googleAnalytics') === true) {
            const ga = this.renderer.createElement('script');
            ga.src = 'https://www.googletagmanager.com/gtag/js?id=UA-135550416-1';
            ga.async = true;
            this.renderer.appendChild(doc.head, ga);

            const gtag = this.renderer.createElement('script');
            gtag.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'UA-135550416-1');`;
            this.renderer.appendChild(doc.head, gtag);

            this.router.events.subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    (<any>window).gtag('config', 'UA-135550416-1', { page_path: event.urlAfterRedirects });
                }
            });
        }
    }

    ngOnInit(): void {
        this.userDataSubscription = this.authSvc.userData$.subscribe((userData: UserData) => {
            this.userData = userData;
        });
        this.router.events.subscribe((evt) => {
            if (!(evt instanceof NavigationEnd)) {
                return;
            }
            window.scrollTo(0, 0);
            const url: string = this.router.url;

            if (!this.userData && !url.includes('/embed/')) {
                this.authSvc.updateUserData();
                console.log('User data updated');
            }
        });
    }

    ngOnDestroy(): void {
        this.userDataSubscription.unsubscribe();
    }
}
