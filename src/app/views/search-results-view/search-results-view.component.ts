import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SearchService } from '@services/search.service';
import { SearchResults } from '@models/search/search-results';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { TranslateService } from '@ngx-translate/core';
import { EducationalLevel } from '@models/koodisto-proxy/educational-level';
import { LearningResourceType } from '@models/koodisto-proxy/learning-resource-type';
import { SubjectFilter } from '@models/koodisto-proxy/subject-filter';

@Component({
  selector: 'app-search-results-view',
  templateUrl: './search-results-view.component.html',
  styleUrls: ['./search-results-view.component.scss']
})
export class SearchResultsViewComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  resultSubscription: Subscription;
  results: SearchResults;

  // filters
  educationalLevelSubscription: Subscription;
  educationalLevels: EducationalLevel[];
  educationalSubjectSubscription: Subscription;
  educationalSubjects: SubjectFilter[];
  learningResourceTypeSubscription: Subscription;
  learningResourceTypes: LearningResourceType[];
  isCollapsedTypes = true;

  constructor(
    private searchSvc: SearchService,
    private fb: FormBuilder,
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe(() => {
      this.koodistoProxySvc.updateEducationalLevels();
      this.koodistoProxySvc.updateSubjectFilters();
      this.koodistoProxySvc.updateLearningResourceTypes();
    });

    this.searchForm = this.fb.group({
      keywords: this.fb.control(null),
      filters: this.fb.group({
        educationalLevels: this.fb.control(null),
        educationalSubjects: this.fb.control(null),
        learningResourceTypes: this.fb.array([]),
      }),
    });

    const searchParams = JSON.parse(sessionStorage.getItem(environment.searchParams));

    if (searchParams) {
      this.keywords.setValue(searchParams.keywords);
    }

    const searchResults = JSON.parse(sessionStorage.getItem(environment.searchResults));

    if (searchResults) {
      this.results = searchResults;
    }

    this.resultSubscription = this.searchSvc.searchResults$
      .subscribe((results: SearchResults) => {
        this.results = results;
      });

    this.educationalLevelSubscription = this.koodistoProxySvc.educationalLevels$
      .subscribe((levels: EducationalLevel[]) => {
        this.educationalLevels = levels;
      });
    this.koodistoProxySvc.updateEducationalLevels();

    this.educationalSubjectSubscription = this.koodistoProxySvc.subjectFilters$
      .subscribe((filters: SubjectFilter[]) => {
        this.educationalSubjects = filters;
      });
    this.koodistoProxySvc.updateSubjectFilters();

    this.learningResourceTypeSubscription = this.koodistoProxySvc.learningResourceTypes$
      .subscribe((types: LearningResourceType[]) => {
        this.learningResourceTypes = types;

        this.learningResourceTypesArray.clear();

        types.forEach((type: LearningResourceType) => {
          let state = false;

          if (searchParams && searchParams.filters && searchParams.filters.learningResourceTypes) {
            state = searchParams.filters.learningResourceTypes.includes(type.key);
          }

          this.learningResourceTypesArray.push(this.fb.control(state));
        });
      });
    this.koodistoProxySvc.updateLearningResourceTypes();
  }

  ngOnDestroy(): void {
    this.resultSubscription.unsubscribe();
    this.educationalLevelSubscription.unsubscribe();
    this.educationalSubjectSubscription.unsubscribe();
    this.learningResourceTypeSubscription.unsubscribe();
  }

  get keywords(): FormControl {
    return this.searchForm.get('keywords') as FormControl;
  }

  get filters(): FormControl {
    return this.searchForm.get('filters') as FormControl;
  }

  get learningResourceTypesArray(): FormArray {
    return this.filters.get('learningResourceTypes') as FormArray;
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      const searchParams = this.searchForm.value;

      const selectedTypes = this.filters.value.learningResourceTypes
        .map((checked: boolean, index: number) => checked ? this.learningResourceTypes[index].key : null)
        .filter((value: string) => value !== null);

      searchParams.filters.learningResourceTypes = selectedTypes;

      this.searchSvc.updateSearchResults(searchParams);
    }
  }
}
