import { Component, Input } from '@angular/core'
import { CollectionSearchResult } from '@models/search/collection-search-results'

@Component({
    selector: 'app-collection-search-result',
    templateUrl: './collection-search-result.component.html',
    styleUrls: ['./collection-search-result.component.scss'],
    standalone: false
})
export class CollectionSearchResultComponent {
  @Input() result: CollectionSearchResult

  constructor() {}
}
