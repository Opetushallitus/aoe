import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SearchService } from '@services/search.service';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { CollectionSearchResults } from '@models/search/collection-search-results';

@Component({
  selector: 'app-collection-search-results-view',
  templateUrl: './collection-search-results-view.component.html',
  styleUrls: ['./collection-search-results-view.component.scss'],
})
export class CollectionSearchResultsViewComponent implements OnInit, OnDestroy {
  resultSubscription: Subscription;
  results: CollectionSearchResults;
  serviceName: string;

  constructor(private searchSvc: SearchService, private translate: TranslateService, private titleService: Title) {}

  ngOnInit(): void {
    this.setTitle();

    this.translate.onLangChange.subscribe(() => {
      this.setTitle();
    });

    this.resultSubscription = this.searchSvc.collectionSearchResults$.subscribe((results: CollectionSearchResults) => {
      this.results = results;
    });
    this.searchSvc.updateCollectionSearchResults({ keywords: null });
  }

  ngOnDestroy(): void {
    this.resultSubscription.unsubscribe();
  }

  setTitle(): void {
    this.translate
      .get(['common.serviceName', 'titles.searchResults'])
      .subscribe((translations: { [key: string]: string }) => {
        this.serviceName = translations['common.serviceName'];
        this.titleService.setTitle(`${translations['titles.searchResults']} - ${this.serviceName}`);
      });
  }
}
