import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { setLanguage } from '../../shared/shared.module';

/**
 * @ignore
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent implements OnInit {
  public alertClosed = false;

  constructor(public translate: TranslateService) { }

  ngOnInit(): void {
    this.alertClosed = localStorage.getItem('aoe.alertClosed10') ? JSON.parse(localStorage.getItem('aoe.alertClosed10')).closed : false;
  }

  /**
   * Set language
   */
  changeLanguage(lang: string): void {
    setLanguage(lang);
    this.translate.use(lang);
  }

  closeAlert(): void {
    localStorage.setItem('aoe.alertClosed10', JSON.stringify({ closed: true }));
    this.alertClosed = true;
  }
}
