import { Component, Input, OnInit } from '@angular/core';
import { SearchResult } from '@models/search/search-results';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent implements OnInit {
  @Input() result: SearchResult;
  downloadUrl: string;

  constructor() { }

  ngOnInit() {
    this.downloadUrl = `${environment.backendUrl}/material/file/${this.result.id}`;
  }

}
