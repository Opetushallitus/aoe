import { Component, OnInit } from '@angular/core'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'
import { PrivacyPolicy } from '../../mocks/privacy-policy.mock'

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  standalone: false
})
export class PrivacyPolicyComponent implements OnInit {
  lang: string = this.translate.currentLang
  privacyPolicy: { heading: string; content: string[] }[]

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.privacyPolicy = PrivacyPolicy[this.translate.currentLang]

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang
      this.privacyPolicy = PrivacyPolicy[event.lang]
    })
  }
}
