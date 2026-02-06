import { Component, OnDestroy, OnInit } from '@angular/core'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'
import { Subscription } from 'rxjs'

import { FAQGeneral } from '../../mocks/faq.general.mock'
import { FAQMaterial } from '../../mocks/faq.material.mock'
import { FAQOrganisation } from '../../mocks/faq.organisation.mock'
import { Title } from '@angular/platform-browser'

@Component({
  selector: 'app-help-view',
  templateUrl: './help-view.component.html',
  standalone: false
})
export class HelpViewComponent implements OnInit, OnDestroy {
  private langChangeSubscription: Subscription
  faqGeneral: { question: string; answer: string[] }[]
  faqMaterial: { question: string; answer: string[] }[]
  faqOrganisation: { question: string; answer: string[] }[]
  isOpen = false
  serviceName: string

  constructor(
    private translate: TranslateService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.setTitle()

    this.faqGeneral = FAQGeneral[this.translate.currentLang]
    this.faqMaterial = FAQMaterial[this.translate.currentLang]
    this.faqOrganisation = FAQOrganisation[this.translate.currentLang]

    this.langChangeSubscription = this.translate.onLangChange.subscribe(
      (event: LangChangeEvent) => {
        this.faqGeneral = FAQGeneral[event.lang]
        this.faqMaterial = FAQMaterial[event.lang]
        this.faqOrganisation = FAQOrganisation[event.lang]

        this.setTitle()
      }
    )
  }

  ngOnDestroy(): void {
    this.langChangeSubscription.unsubscribe()
  }

  setTitle(): void {
    this.translate
      .get(['common.serviceName', 'titles.faq'])
      .subscribe((translations: { [key: string]: string }) => {
        this.titleService.setTitle(
          `${translations['titles.faq']} - ${translations['common.serviceName']}`
        )
      })
  }
}
