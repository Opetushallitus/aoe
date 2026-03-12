import { Component, Input } from '@angular/core'
import { CollectionSearchResult } from '@models/search/collection-search-results'
import { FocusRemoverDirective } from '../../directives/focus-remover.directive'
import { RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'

@Component({
  selector: 'app-collection-search-result',
  templateUrl: './collection-search-result.component.html',
  styleUrls: ['./collection-search-result.component.scss'],
  imports: [FocusRemoverDirective, RouterLink, TranslatePipe]
})
export class CollectionSearchResultComponent {
  @Input() result: CollectionSearchResult

  constructor() {}
}
