import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { CookieService } from '../../services/cookie.service';

@Component({
  selector: 'app-cookie-notice',
  templateUrl: './cookie-notice.component.html',
})
export class CookieNoticeComponent implements OnInit {
  cookies: FormGroup;
  @Output() hideCookieNotice = new EventEmitter();
  lang: string = this.translate.currentLang;

  constructor(
    private fb: FormBuilder,
    private cookieSvc: CookieService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.cookies = this.fb.group({
      aoe: this.fb.control({ value: true, disabled: true }, [ Validators.requiredTrue ]),
      googleAnalytics: this.fb.control(true),
    });
  }

  acceptAll(): void {
    this.cookies.setValue({
      aoe: true,
      googleAnalytics: true,
    });

    this.onSubmit();
  }

  onSubmit(): void {
    // set cookie settings
    this.cookieSvc.setCookieSettings(this.cookies.value);

    // hide cookie notice
    this.hideCookieNotice.emit();
  }
}
