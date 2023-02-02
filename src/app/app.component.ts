import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';

import { getLanguage, setLanguage } from './shared/shared.module';
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
        private authService: AuthService,
    ) {
        translate.addLangs(['fi', 'en', 'sv']);
        translate.setDefaultLang('fi');

        const lang = getLanguage();

        if (lang === null) {
            const browserLang = translate.getBrowserLang();
            console.debug('Browser language: ', browserLang);
            setLanguage(browserLang.match(/fi|en|sv/) ? browserLang : 'fi');
            translate.use(browserLang);
        } else {
            translate.use(lang);
        }

        translate.onLangChange.subscribe((event: LangChangeEvent) => {
            renderer.setAttribute(doc.documentElement, 'lang', event.lang);
        });
    }

    ngOnInit(): void {
        this.userDataSubscription = this.authService.userData$.subscribe((userData: UserData) => {
            this.userData = userData;
        });
        this.router.events.subscribe((evt) => {
            if (!(evt instanceof NavigationEnd)) {
                return;
            }
            window.scrollTo(0, 0);
            const url: string = this.router.url;

            if (!this.userData && !url.includes('/embed/')) {
                this.authService.updateUserData();
            }
        });
    }

    ngOnDestroy(): void {
        this.userDataSubscription.unsubscribe();
    }
}
