import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SearchResult } from '@models/search/search-results';
import { environment } from '../../../environments/environment';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SearchParams } from '@models/search/search-params';
import { UsedFilter } from '@models/search/used-filter';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent implements OnInit {
  @Input() result: SearchResult;
  @Output() executeFilteredSearch = new EventEmitter();
  lang: string = this.translate.currentLang;
  materialName: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl: string;
  private from = 0;
  private resultsPerPage = 15;

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

    if (this.result.thumbnail) {
      this.thumbnailUrl = this.result.thumbnail.filepath;
    } else {
      this.thumbnailUrl = `assets/img/thumbnails/${this.result.learningResourceTypes[0].learningresourcetypekey}.png`;
    }
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
    }
  }

  filterSearch(key: string, value: string): void {
    const searchParams: SearchParams = {
      keywords: null,
      filters: {
        educationalLevels: [key],
      },
      from: this.from,
      size: this.resultsPerPage,
    };

    const usedFilters: UsedFilter[] = [
      {
        key: key,
        value: value,
        type: 'level',
      }
    ];

    sessionStorage.setItem(environment.searchParams, JSON.stringify(searchParams));
    sessionStorage.setItem(environment.usedFilters, JSON.stringify(usedFilters));

    this.executeFilteredSearch.emit();
  }
}
