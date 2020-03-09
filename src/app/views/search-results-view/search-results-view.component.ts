import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SearchService } from '@services/search.service';
import { SearchResult, SearchResults } from '@models/search/search-results';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { TranslateService } from '@ngx-translate/core';
import { EducationalLevel } from '@models/koodisto-proxy/educational-level';
import { LearningResourceType } from '@models/koodisto-proxy/learning-resource-type';
import { SubjectFilter } from '@models/koodisto-proxy/subject-filter';
import { deduplicate } from '../../shared/shared.module';

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
  isCollapsedLevels = true;
  educationalSubjectSubscription: Subscription;
  educationalSubjects: SubjectFilter[];
  learningResourceTypeSubscription: Subscription;
  learningResourceTypes: LearningResourceType[];
  isCollapsedTypes = true;
  authors: string[] = [];
  isCollapsedAuthors = true;
  organizations: any[] = [];
  isCollapsedOrganizations = true;
  educationalRoles: any[] = [];
  isCollapsedRoles = true;
  keywords: any[] = [];
  isCollapsedKeywords = true;
  languages: string[] = [];
  isCollapsedLanguages = true;

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
        educationalLevels: this.fb.array([]),
        educationalSubjects: this.fb.control(null),
        learningResourceTypes: this.fb.array([]),
        authors: this.fb.array([]),
        organizations: this.fb.array([]),
        educationalRoles: this.fb.array([]),
        keywords: this.fb.array([]),
        languages: this.fb.array([]),
      }),
    });

    const searchParams = JSON.parse(sessionStorage.getItem(environment.searchParams));

    if (searchParams) {
      this.keywordsCtrl.setValue(searchParams.keywords);
    }

    const searchResults = JSON.parse(sessionStorage.getItem(environment.searchResults));

    if (searchResults) {
      this.results = searchResults;
      this.setAvailableFilters(searchResults);
    }

    this.resultSubscription = this.searchSvc.searchResults$
      .subscribe((results: SearchResults) => {
        this.results = results;

        this.setAvailableFilters(results);
      });

    this.educationalLevelSubscription = this.koodistoProxySvc.educationalLevels$
      .subscribe((levels: EducationalLevel[]) => {
        this.educationalLevels = levels;

        this.educationalLevelsArray.clear();

        levels.forEach((level: EducationalLevel) => {
          const children = this.fb.array([]);

          level.children.forEach((child) => {
            let state = false;

            if (searchParams && searchParams.filters && searchParams.filters.educationalLevels) {
              state = searchParams.filters.educationalLevels.includes(child.key);
            }

            children.push(this.fb.control(state));
          });

          this.educationalLevelsArray.push(this.fb.group({
            levels: children,
          }));
        });
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

  get keywordsCtrl(): FormControl {
    return this.searchForm.get('keywords') as FormControl;
  }

  get filters(): FormControl {
    return this.searchForm.get('filters') as FormControl;
  }

  get filtersCount(): number {
    return this.educationalLevelsCount
      + this.learningResourceTypesCount
      + this.authorsCount
      + this.organizationsCount
      + this.educationalRolesCount
      + this.keywordsCount
      + this.languagesCount;
  }

  get educationalLevelsArray(): FormArray {
    return this.filters.get('educationalLevels') as FormArray;
  }

  get educationalLevelsCount(): number {
    let count = 0;

    this.educationalLevelsArray.value.forEach((level) => {
      count += level.levels.filter((v: boolean) => v === true).length;
    });

    return count;
  }

  get learningResourceTypesArray(): FormArray {
    return this.filters.get('learningResourceTypes') as FormArray;
  }

  get learningResourceTypesCount(): number {
    return this.learningResourceTypesArray.value.filter((v: boolean) => v === true).length;
  }

  get authorsArray(): FormArray {
    return this.filters.get('authors') as FormArray;
  }

  get authorsCount(): number {
    return this.authorsArray.value.filter((v: boolean) => v === true).length;
  }

  get organizationsArray(): FormArray {
    return this.filters.get('organizations') as FormArray;
  }

  get organizationsCount(): number {
    return this.organizationsArray.value.filter((v: boolean) => v === true).length;
  }

  get educationalRolesArray(): FormArray {
    return this.filters.get('educationalRoles') as FormArray;
  }

  get educationalRolesCount(): number {
    return this.educationalRolesArray.value.filter((v: boolean) => v === true).length;
  }

  get keywordsArray(): FormArray {
    return this.filters.get('keywords') as FormArray;
  }

  get keywordsCount(): number {
    return this.keywordsArray.value.filter((v: boolean) => v === true).length;
  }

  get languagesArray(): FormArray {
    return this.filters.get('languages') as FormArray;
  }

  get languagesCount(): number {
    return this.languagesArray.value.filter((v: boolean) => v === true).length;
  }

  setAvailableFilters(results: SearchResults): void {
    const searchParams = JSON.parse(sessionStorage.getItem(environment.searchParams));

    const allAuthors: string[] = [];
    this.authorsArray.clear();

    const allOrganizations: any[] = [];
    this.organizationsArray.clear();

    const allRoles: any[] = [];
    this.educationalRolesArray.clear();

    const allKeywords: any[] = [];
    this.keywordsArray.clear();

    const allLanguages: string[] = [];
    this.languagesArray.clear();

    results.results.forEach((result: SearchResult) => {
      // authors and organizations
      result.authors.forEach((author) => {
        if (author.authorname !== '') {
          allAuthors.push(author.authorname.trim());
        }

        if (author.organization !== '') {
          allOrganizations.push({
            key: author.organizationkey.trim(),
            value: author.organization.trim(),
          });
        }
      });

      // educational roles
      if (result.educationalRoles && result.educationalRoles.length > 0) {
        result.educationalRoles.forEach((role) => {
          allRoles.push({
            key: role.educationalrolekey,
            value: role.value.trim(),
          });
        });
      }

      // keywords
      result.keywords.forEach((keyword) => {
        allKeywords.push({
          key: keyword.keywordkey,
          value: keyword.value,
        });
      });

      // languages
      result.languages.forEach((language: string) => {
        allLanguages.push(language.toLowerCase());
      });
    });

    // https://stackoverflow.com/a/14438954
    this.authors = [...new Set(allAuthors)];
    this.organizations = deduplicate(allOrganizations, 'key');
    this.educationalRoles = deduplicate(allRoles, 'key');
    this.keywords = deduplicate(allKeywords, 'key');
    this.languages = [...new Set(allLanguages)];

    this.authors.forEach((author: string) => {
      let state = false;

      if (searchParams && searchParams.filters && searchParams.filters.authors) {
        state = searchParams.filters.authors.includes(author);
      }

      this.authorsArray.push(this.fb.control(state));
    });

    this.organizations.forEach((organization) => {
      let state = false;

      if (searchParams && searchParams.filters && searchParams.filters.organizations) {
        state = searchParams.filters.organizations.includes(organization.key);
      }

      this.organizationsArray.push(this.fb.control(state));
    });

    this.educationalRoles.forEach((role) => {
      let state = false;

      if (searchParams && searchParams.filters && searchParams.filters.educationalRoles) {
        state = searchParams.filters.educationalRoles.includes(role.key);
      }

      this.educationalRolesArray.push(this.fb.control(state));
    });

    this.keywords.forEach((keyword) => {
      let state = false;

      if (searchParams && searchParams.filters && searchParams.filters.keywords) {
        state = searchParams.filters.keywords.includes(keyword.key);
      }

      this.keywordsArray.push(this.fb.control(state));
    });

    this.languages.forEach((language: string) => {
      let state = false;

      if (searchParams && searchParams.filters && searchParams.filters.languages) {
        state = searchParams.filters.languages.includes(language);
      }

      this.languagesArray.push(this.fb.control(state));
    });
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      const searchParams = this.searchForm.value;
      const selectedEducationalLevels: string[] = [];

      this.filters.value.educationalLevels
        .forEach((level, index: number) => {
          level.levels.forEach((checked: boolean, childIndex: number) => {
            if (checked) {
              selectedEducationalLevels.push(this.educationalLevels[index].children[childIndex].key);
            }
          });
        });

      searchParams.filters.educationalLevels = selectedEducationalLevels;

      searchParams.filters.learningResourceTypes = this.filters.value.learningResourceTypes
        .map((checked: boolean, index: number) => checked ? this.learningResourceTypes[index].key : null)
        .filter((value: string) => value !== null);

      searchParams.filters.authors = this.filters.value.authors
        .map((checked: boolean, index: number) => checked ? this.authors[index] : null)
        .filter((value: string) => value !== null);

      searchParams.filters.organizations = this.filters.value.organizations
        .map((checked: boolean, index: number) => checked ? this.organizations[index].key : null)
        .filter((value: string) => value !== null);

      searchParams.filters.educationalRoles = this.filters.value.educationalRoles
        .map((checked: boolean, index: number) => checked ? this.educationalRoles[index].key : null)
        .filter((value: string) => value !== null);

      searchParams.filters.keywords = this.filters.value.keywords
        .map((checked: boolean, index: number) => checked ? this.keywords[index].key : null)
        .filter((value: string) => value !== null);

      searchParams.filters.languages = this.filters.value.languages
        .map((checked: boolean, index: number) => checked ? this.languages[index] : null)
        .filter((language: string) => language !== null);

      this.searchSvc.updateSearchResults(searchParams);
    }
  }
}
