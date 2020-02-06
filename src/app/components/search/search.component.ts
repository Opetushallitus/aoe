import { Component, OnDestroy, OnInit } from '@angular/core';
import { SearchService } from '@services/search.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SearchResults } from '@models/search/search-results';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  resultSubscription: Subscription;
  results: SearchResults;

  constructor(
    private searchSvc: SearchService,
    private fb: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      keywords: this.fb.control(null, [ Validators.required ]),
    });

    this.resultSubscription = this.searchSvc.searchResults$
      .subscribe(results => {
        this.results = results;
      });
  }

  ngOnDestroy(): void {
    this.resultSubscription.unsubscribe();
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      this.searchSvc.updateSearchResults(this.searchForm.value);

      this.router.navigate(['/haku']);
    }
  }
}
