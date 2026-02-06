import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'

import { CookieService } from '@services/cookie.service'

@Component({
    selector: 'app-cookie-notice',
    templateUrl: './cookie-notice.component.html',
    standalone: false
})
export class CookieNoticeComponent implements OnInit {
  @Output() hideCookieNotice = new EventEmitter()
  lang: string = this.translate.currentLang

  constructor(
    private cookieService: CookieService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang
    })
  }

  onSubmit(): void {
    // accept cookie policy
    this.cookieService.acceptCookiePolicy()

    // hide cookie notice
    this.hideCookieNotice.emit()
  }
}
