import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CookieService } from '../../services/cookie.service';

@Component({
  selector: 'app-cookie-notice',
  templateUrl: './cookie-notice.component.html',
})
export class CookieNoticeComponent implements OnInit {
  cookies: FormGroup;
  @Output() hideCookieNotice = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private cookieSvc: CookieService,
  ) { }

  ngOnInit() {
    this.cookies = this.fb.group({
      aoe: this.fb.control({ value: true, disabled: true }, [ Validators.requiredTrue ]),
      googleAnalytics: this.fb.control(false),
    });
  }

  onSubmit(): void {
    // set cookie settings
    this.cookieSvc.setCookieSettings(this.cookies.value);

    // hide cookie notice
    this.hideCookieNotice.emit();
  }
}
