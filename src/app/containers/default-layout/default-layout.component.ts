import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { getUsername, removeUserdata, setLanguage, setUsername } from '../../shared/shared.module';

/**
 * @ignore
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent {
  constructor(public translate: TranslateService) { }

  /**
   * Set language
   */
  public changeLanguage(lang: string): void {
    setLanguage(lang);
    this.translate.use(lang);
  }

  public login(): void {
    setUsername('maija.mehilainen@aoe.fi');
  }

  public logout(): void {
    removeUserdata();
  }

  public isLoggedIn(): boolean {
    return !!getUsername();
  }
}
