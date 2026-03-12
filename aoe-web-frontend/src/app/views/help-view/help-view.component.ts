import { Component, OnDestroy, OnInit } from '@angular/core'
import { LangChangeEvent, TranslateService, TranslatePipe } from '@ngx-translate/core'
import { Subscription } from 'rxjs'

import { FAQGeneral } from '../../mocks/faq.general.mock'
import { FAQMaterial } from '../../mocks/faq.material.mock'
import { FAQOrganisation } from '../../mocks/faq.organisation.mock'
import { Title } from '@angular/platform-browser'
import { FocusRemoverDirective } from '../../directives/focus-remover.directive'
import { AccordionComponent, AccordionPanelComponent } from 'ngx-bootstrap/accordion'
import { NgClass } from '@angular/common'

@Component({
  selector: 'app-help-view',
  templateUrl: './help-view.component.html',
  imports: [
    FocusRemoverDirective,
    AccordionComponent,
    AccordionPanelComponent,
    NgClass,
    TranslatePipe
  ]
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

    this.faqGeneral = FAQGeneral[this.translate.getCurrentLang()]
    this.faqMaterial = FAQMaterial[this.translate.getCurrentLang()]
    this.faqOrganisation = FAQOrganisation[this.translate.getCurrentLang()]

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
