import { Component, OnDestroy, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { INFOPAGE } from '../../mocks/demo/info-page.mock';

@Component({
  selector: 'app-info-view',
  templateUrl: './info-view.component.html',
})
export class InfoViewComponent implements OnInit, OnDestroy {
  private langChangeSubscription: Subscription;
  private contents = INFOPAGE;
  public pageContent;

  constructor(private translate: TranslateService) { }

  ngOnInit(): void {
    this.pageContent = this.contents[this.translate.currentLang];


    this.langChangeSubscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pageContent = this.contents[event.lang];
    });
  }

  ngOnDestroy(): void {
    this.langChangeSubscription.unsubscribe();
  }
}
