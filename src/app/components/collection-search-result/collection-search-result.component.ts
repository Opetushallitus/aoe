import { Component, Input, OnInit } from '@angular/core';
import { CollectionSearchResult } from '@models/search/collection-search-results';

@Component({
  selector: 'app-collection-search-result',
  templateUrl: './collection-search-result.component.html',
  styleUrls: ['./collection-search-result.component.scss']
})
export class CollectionSearchResultComponent implements OnInit {
  @Input() result: CollectionSearchResult;

  constructor() { }

  ngOnInit(): void { }
}
