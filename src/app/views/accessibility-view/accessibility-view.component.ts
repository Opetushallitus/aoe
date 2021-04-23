import { Component, OnInit } from '@angular/core';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { Title } from '@angular/platform-browser';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { AccessibilityTable } from '@models/mocks/accessibility-table';
import { Accessibility } from '../../mocks/accessibility.mock';

@Component({
  selector: 'app-accessibility-view',
  templateUrl: './accessibility-view.component.html',
  styleUrls: ['./accessibility-view.component.scss']
})
export class AccessibilityViewComponent implements OnInit {
  lang: string = this.translate.currentLang;
  accessibilityTable: AccessibilityTable = Accessibility;

  constructor(
    private koodistoSvc: KoodistoProxyService,
    private titleSvc: Title,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.setTitle();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.setTitle();
    });
  }

  setTitle(): void {
    this.translate.get('titles.accessibility').subscribe((title: string) => {
      this.titleSvc.setTitle(`${title} ${environment.title}`);
    });
  }
}
