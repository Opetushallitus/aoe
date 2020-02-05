import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SearchService } from '@services/search.service';
import { SearchResult, SearchResults } from '@models/search/search-results';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-results-view',
  templateUrl: './search-results-view.component.html',
  styleUrls: ['./search-results-view.component.scss']
})
export class SearchResultsViewComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  resultSubscription: Subscription;
  results: SearchResults;

  constructor(
    private searchSvc: SearchService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.searchForm = this.fb.group({
      keywords: this.fb.control(null, [ Validators.required ]),
    });

    this.resultSubscription = this.searchSvc.searchResults$.subscribe((results: SearchResults) => {
      this.results = results;
    });
  }

  ngOnDestroy(): void {
    this.resultSubscription.unsubscribe();
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      this.searchSvc.updateSearchResults(this.searchForm.value);
    }
  }
}
