import { Component, OnDestroy, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { FAQGeneral } from '../../mocks/faq.general.mock';
import { FAQMaterial } from '../../mocks/faq.material.mock';
import { FAQOrganisation } from '../../mocks/faq.organisation.mock';

@Component({
  selector: 'app-help-view',
  templateUrl: './help-view.component.html',
})
export class HelpViewComponent implements OnInit, OnDestroy {
  private langChangeSubscription: Subscription;
  public faqGeneral;
  public faqMaterial;
  public faqOrganisation;

  constructor(private translate: TranslateService) { }

  ngOnInit(): void {
    this.faqGeneral = FAQGeneral[this.translate.currentLang];
    this.faqMaterial = FAQMaterial[this.translate.currentLang];
    this.faqOrganisation = FAQOrganisation[this.translate.currentLang];

    this.langChangeSubscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.faqGeneral = FAQGeneral[event.lang];
      this.faqMaterial = FAQMaterial[event.lang];
      this.faqOrganisation = FAQOrganisation[event.lang];
    });
  }

  ngOnDestroy(): void {
    this.langChangeSubscription.unsubscribe();
  }
}
