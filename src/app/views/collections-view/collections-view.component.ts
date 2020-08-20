import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-collections-view',
  templateUrl: './collections-view.component.html',
  styleUrls: ['./collections-view.component.scss']
})
export class CollectionsViewComponent implements OnInit {
  lang: string = this.translate.currentLang;

  constructor(
    private translate: TranslateService,
    private titleSvc: Title,
  ) { }

  ngOnInit(): void {
    this.setTitle();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.setTitle();
    });
  }

  setTitle(): void {
    this.translate.get('titles.home').subscribe((title: string) => {
      this.titleSvc.setTitle(`${title} ${environment.title}`);
    });
  }
}
