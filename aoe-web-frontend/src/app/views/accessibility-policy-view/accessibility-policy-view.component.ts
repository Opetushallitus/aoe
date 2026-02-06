import { Component, OnInit } from '@angular/core'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'
import { Title } from '@angular/platform-browser'
import { AccessibilityPolicy } from '../../mocks/accessibility-policy.mock'

@Component({
    selector: 'app-accessibility-policy-view',
    templateUrl: './accessibility-policy-view.component.html',
    standalone: false
})
export class AccessibilityPolicyViewComponent implements OnInit {
  lang: string = this.translate.currentLang
  accessibilityPolicy: { heading: string; content: string[] }[]

  constructor(
    private translate: TranslateService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.setTitle()
    this.accessibilityPolicy = AccessibilityPolicy[this.translate.currentLang]

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang
      this.accessibilityPolicy = AccessibilityPolicy[event.lang]

      this.setTitle()
    })
  }

  setTitle(): void {
    this.translate
      .get(['common.serviceName', 'titles.accessibility'])
      .subscribe((translations: { [key: string]: string }) => {
        this.titleService.setTitle(
          `${translations['titles.accessibility']} - ${translations['common.serviceName']}`
        )
      })
  }
}
