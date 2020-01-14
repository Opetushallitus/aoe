import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-accessibility-policy-view',
  templateUrl: './accessibility-policy-view.component.html',
})
export class AccessibilityPolicyViewComponent implements OnInit {
  lang: string = this.translate.currentLang;

  constructor(
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });
  }
}
