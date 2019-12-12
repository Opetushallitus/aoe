import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: 'main-view.component.html'
})
export class MainViewComponent implements OnInit {
  lang: string = this.translate.currentLang;

  constructor(
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });
  }
}
