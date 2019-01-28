import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { setLanguage } from '../../shared/shared.module';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent {
  constructor(public translate: TranslateService) { }

  changeLanguage(lang: string): void {
    setLanguage(lang);
    this.translate.use(lang);
  }
}
