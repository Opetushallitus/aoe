import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SearchService } from '@services/search.service';

@Component({
  selector: 'app-search-results-view',
  templateUrl: './search-results-view.component.html',
  styleUrls: ['./search-results-view.component.scss']
})
export class SearchResultsViewComponent implements OnInit {
  searchForm: FormGroup;

  constructor(
    private searchSvc: SearchService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.searchForm = this.fb.group({
      keywords: this.fb.control(null, [ Validators.required ]),
    });
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      // search magic
    }
  }
}
