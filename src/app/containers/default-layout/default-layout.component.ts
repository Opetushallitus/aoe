import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent {
  constructor(private translate: TranslateService) { }

  changeLanguage(lang: string) {
    localStorage.setItem('user', JSON.stringify({ lang: lang }));
    this.translate.use(lang);
  }
}
