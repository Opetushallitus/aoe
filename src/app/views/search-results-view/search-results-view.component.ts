import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SearchService } from '@services/search.service';
import { SearchResults } from '@models/search/search-results';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

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
      keywords: this.fb.control(null),
    });

    const searchParams = JSON.parse(sessionStorage.getItem(environment.searchParams));

    if (searchParams) {
      this.searchForm.patchValue(searchParams);
    }

    const searchResults = JSON.parse(sessionStorage.getItem(environment.searchResults));

    if (searchResults) {
      this.results = searchResults;
    }

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
