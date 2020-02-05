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
  lang: string;
  downloadUrl: string;

  constructor(
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.downloadUrl = `${environment.backendUrl}/material/file/${this.result.id}`;
  }
}
