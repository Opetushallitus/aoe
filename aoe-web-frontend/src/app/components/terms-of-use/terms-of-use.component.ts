import { Component, OnInit } from '@angular/core'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'
import { TermsOfUse } from '../../mocks/terms-of-use.mock'

@Component({
  selector: 'app-terms-of-use',
  templateUrl: './terms-of-use.component.html',
  standalone: false
})
export class TermsOfUseComponent implements OnInit {
  lang: string = this.translate.currentLang
  termsOfUse: { heading: string; content: string[] }[]

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.termsOfUse = TermsOfUse[this.translate.currentLang]
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang
      this.termsOfUse = TermsOfUse[event.lang]
    })
  }
}
