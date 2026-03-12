import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { LangChangeEvent, TranslateService, TranslatePipe } from '@ngx-translate/core'

import { CookieService } from '@services/cookie.service'
import { FocusRemoverDirective } from '../../directives/focus-remover.directive';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-cookie-notice',
    templateUrl: './cookie-notice.component.html',
    imports: [FocusRemoverDirective, ModalDirective, TranslatePipe]
})
export class CookieNoticeComponent implements OnInit {
  @Output() hideCookieNotice = new EventEmitter()
  lang: string = this.translate.getCurrentLang()

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
