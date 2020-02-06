import { Component, Input, OnInit } from '@angular/core';
import { SearchResult } from '@models/search/search-results';
import { environment } from '../../../environments/environment';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent implements OnInit {
  @Input() result: SearchResult;
  lang: string = this.translate.currentLang;
  materialName: string;
  description: string;
  downloadUrl: string;

  constructor(
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.changeTranslationString();
    });

    this.changeTranslationString();

    this.downloadUrl = `${environment.backendUrl}/material/file/${this.result.id}`;
  }

  changeTranslationString(): void {
    const name = this.result.materialName.find(n => n.language === this.lang).materialname;

    if (name !== '') {
      this.materialName = name;
    } else {
      this.materialName = this.result.materialName.find(n => n.materialname !== '').materialname;
    }

    const description = this.result.description.find(d => d.language === this.lang).description;

    if (description !== '') {
      this.description = description;
    } else {
      this.description = this.result.description.find(d => d.description !== '').description;
    }
  }
}
