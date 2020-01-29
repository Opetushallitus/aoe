import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SearchService } from '@services/search.service';
import { SearchResult } from '@models/search/search-results';

@Component({
  selector: 'app-search-results-view',
  templateUrl: './search-results-view.component.html',
  styleUrls: ['./search-results-view.component.scss']
})
export class SearchResultsViewComponent implements OnInit {
  searchForm: FormGroup;
  results: SearchResult[] = [];

  constructor(
    private searchSvc: SearchService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.searchForm = this.fb.group({
      keywords: this.fb.control(null, [ Validators.required ]),
    });

    this.results.push({
      id: 1,
      createdAt: new Date(2019, 1, 3),
      name: 'Mock material',
      description: 'Kuvaus',
      authors: [
        {
          authorname: 'Mehiläinen, Maija',
        },
      ],
      learningResourceTypes: [
        {
          learningresourcetypekey: 'key',
          value: 'video',
        }
      ],
      license: 'CCBY4.0',
      educationalLevels: [
        {
          educationallevelkey: 'key',
          value: 'Yläaste',
        },
      ],
    });

    this.results.push({
      id: 2,
      createdAt: new Date(2020, 0, 15),
      name: 'Mock material 2',
      description: 'Kuvaus 2',
      authors: [
        {
          authorname: 'Mehiläinen, Maija 2',
        },
      ],
      learningResourceTypes: [
        {
          learningresourcetypekey: 'key',
          value: 'audio',
        }
      ],
      license: 'CCBY4.0',
      educationalLevels: [
        {
          educationallevelkey: 'key',
          value: 'Yläaste',
        },
      ],
    });
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      // search magic
    }
  }
}
