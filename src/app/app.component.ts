import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  // tslint:disable-next-line
  selector: 'body',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {
  constructor(private router: Router, private translate: TranslateService) {
    translate.addLangs(['fi', 'en', 'sv']);
    translate.setDefaultLang('fi');

    const user = JSON.parse(localStorage.getItem('user'));

    if (user === null) {
      const browserLang = translate.getBrowserLang();
      localStorage.setItem('user', JSON.stringify({ lang: browserLang.match(/fi|en|sv/) ? browserLang : 'fi' }));

      translate.use(browserLang);
    } else {
      translate.use(user.lang);
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
