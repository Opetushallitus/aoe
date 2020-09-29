import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SearchService } from '@services/search.service';
import { SearchResults } from '@models/search/search-results';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { TranslateService } from '@ngx-translate/core';
import { EducationalLevel } from '@models/koodisto-proxy/educational-level';
import { LearningResourceType } from '@models/koodisto-proxy/learning-resource-type';
import { Language } from '@models/koodisto-proxy/language';
import { Title } from '@angular/platform-browser';
import { SearchParams } from '@models/search/search-params';
import { SearchFilterEducationalSubject, SearchFilters } from '@models/search/search-filters';
import { UsedFilter } from '@models/search/used-filter';

@Component({
  selector: 'app-search-results-view',
  templateUrl: './search-results-view.component.html',
  styleUrls: ['./search-results-view.component.scss']
})
export class SearchResultsViewComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  resultSubscription: Subscription;
  results: SearchResults;
  page = 1;
  resultsPerPage = 15;
  loading: boolean;
  @ViewChild('resultsContainer') resultsContainer: ElementRef;

  // filters
  searchFilters: SearchFilters;
  searchFilterSubscription: Subscription;
  filtersShownAtFirst = 8;
  filtersShown = new Map();
  languageSubscription: Subscription;
  allLanguages: Language[];
  isCollapsedLanguages = true;
  showAllLanguages = true;
  educationalLevelSubscription: Subscription;
  educationalLevels: EducationalLevel[];
  isCollapsedLevels = true;
  isCollapsedSubjects = true;
  showAllSubjects = true;
  isCollapsedTeaches = true;
  showAllTeaches = true;
  teachesTruncates = new Map();
  learningResourceTypeSubscription: Subscription;
  learningResourceTypes: LearningResourceType[];
  isCollapsedTypes = true;
  isCollapsedAuthors = true;
  showAllAuthors = true;
  isCollapsedOrganizations = true;
  showAllOrganizations = true;
  isCollapsedRoles = true;
  showAllRoles = true;
  isCollapsedKeywords = true;
  showAllKeywords = true;
  usedFilters: UsedFilter[] = [];

  constructor(
    private searchSvc: SearchService,
    private fb: FormBuilder,
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
    private titleSvc: Title,
  ) { }

  ngOnInit() {
    this.setTitle();

    this.translate.onLangChange.subscribe(() => {
      this.setTitle();

      this.koodistoProxySvc.updateLanguages();
      this.koodistoProxySvc.updateEducationalLevels();
      this.koodistoProxySvc.updateLearningResourceTypes();
    });

    this.searchForm = this.fb.group({
      keywords: this.fb.control(null),
      filters: this.fb.group({
        languages: this.fb.array([]),
        educationalLevels: this.fb.array([]),
        educationalSubjects: this.fb.array([]),
        teaches: this.fb.array([]),
        learningResourceTypes: this.fb.array([]),
        authors: this.fb.array([]),
        organizations: this.fb.array([]),
        educationalRoles: this.fb.array([]),
        keywords: this.fb.array([]),
      }),
    });

    let searchParams: SearchParams = JSON.parse(sessionStorage.getItem(environment.searchParams));

    if (searchParams) {
      this.keywordsCtrl.setValue(searchParams.keywords);
    } else {
      searchParams = {
        keywords: null,
        filters: {},
      };
    }

    this.searchSvc.updateSearchResults(searchParams);
    this.searchSvc.updateSearchFilters(searchParams);

    this.resultSubscription = this.searchSvc.searchResults$
      .subscribe((results: SearchResults) => {
        this.results = results;
        this.loading = false;
      });

    this.searchFilterSubscription = this.searchSvc.searchFilters$.subscribe((filters: SearchFilters) => {
      this.searchFilters = filters;

      this.setAvailableFilters(filters);

      this.showAllLanguages = this.languagesArray.controls.length > this.filtersShownAtFirst;
      this.showAllSubjects = this.subjectsArray.controls.length > this.filtersShownAtFirst;
      this.showAllTeaches = this.teachesArray.controls.length > this.filtersShownAtFirst;
      this.showAllAuthors = this.authorsArray.controls.length > this.filtersShownAtFirst;
      this.showAllOrganizations = this.organizationsArray.controls.length > this.filtersShownAtFirst;
      this.showAllRoles = this.educationalRolesArray.controls.length > this.filtersShownAtFirst;
      this.showAllKeywords = this.keywordsArray.controls.length > this.filtersShownAtFirst;
    });

    this.languageSubscription = this.koodistoProxySvc.languages$.subscribe((languages: Language[]) => {
      this.allLanguages = languages;
    });
    this.koodistoProxySvc.updateLanguages();

    this.educationalLevelSubscription = this.koodistoProxySvc.educationalLevels$
      .subscribe((levels: EducationalLevel[]) => {
        this.educationalLevels = levels;

        this.educationalLevelsArray.clear();

        levels.forEach((level: EducationalLevel, index: number) => {
          const children = this.fb.array([]);

          level.children.forEach((child, childIndex: number) => {
            let state = false;

            if (searchParams?.filters?.educationalLevels) {
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

    this.learningResourceTypeSubscription = this.koodistoProxySvc.learningResourceTypes$
      .subscribe((types: LearningResourceType[]) => {
        this.learningResourceTypes = types;

        this.learningResourceTypesArray.clear();

        types.forEach((type: LearningResourceType, index: number) => {
          let state = false;

          if (searchParams?.filters?.learningResourceTypes) {
            state = searchParams.filters.learningResourceTypes.includes(type.key);
          }

          this.learningResourceTypesArray.push(this.fb.control(state));
        });
      });
    this.koodistoProxySvc.updateLearningResourceTypes();
  }

  ngOnDestroy(): void {
    this.resultSubscription.unsubscribe();
    this.languageSubscription.unsubscribe();
    this.educationalLevelSubscription.unsubscribe();
    this.learningResourceTypeSubscription.unsubscribe();
    this.searchFilterSubscription.unsubscribe();

    sessionStorage.removeItem(environment.searchParams);
  }

  setTitle(): void {
    this.translate.get('titles.searchResults').subscribe((title: string) => {
      this.titleSvc.setTitle(`${title} ${this.page} ${environment.title}`);
    });
  }

  get keywordsCtrl(): FormControl {
    return this.searchForm.get('keywords') as FormControl;
  }

  get filters(): FormControl {
    return this.searchForm.get('filters') as FormControl;
  }

  get filtersCount(): number {
    return this.languagesCount
      + this.educationalLevelsCount
      + this.learningResourceTypesCount
      + this.authorsCount
      + this.organizationsCount
      + this.educationalRolesCount
      + this.keywordsCount
      + this.subjectsCount
      + this.teachesCount;
  }

  get languagesArray(): FormArray {
    return this.filters.get('languages') as FormArray;
  }

  get languagesCount(): number {
    return this.languagesArray.value.filter((v: boolean) => v === true).length;
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

  get subjectsArray(): FormArray {
    return this.filters.get('educationalSubjects') as FormArray;
  }

  get subjectsCount(): number {
    return this.subjectsArray.value.filter((v: boolean) => v === true).length;
  }

  get teachesArray(): FormArray {
    return this.filters.get('teaches') as FormArray;
  }

  get teachesCount(): number {
    return this.teachesArray.value.filter((v: boolean) => v === true).length;
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

  get from(): number {
    return (this.page - 1) * this.resultsPerPage;
  }

  removeFilter(type: string, index: number, childIndex?: number) {
    switch (type) {
      case 'language':
        this.languagesArray.at(index).setValue(false);
        break;

      case 'level':
        const levels = this.educationalLevelsArray.at(index).get('levels') as FormArray;
        levels.at(childIndex).setValue(false);
        break;

      case 'subject':
        this.subjectsArray.at(index).setValue(false);
        break;

      case 'teach':
        this.teachesArray.at(index).setValue(false);
        break;

      case 'type':
        this.learningResourceTypesArray.at(index).setValue(false);
        break;

      case 'author':
        this.authorsArray.at(index).setValue(false);
        break;

      case 'organization':
        this.organizationsArray.at(index).setValue(false);
        break;

      case 'role':
        this.educationalRolesArray.at(index).setValue(false);
        break;

      case 'keyword':
        this.keywordsArray.at(index).setValue(false);
        break;

      default:
        break;
    }

    this.usedFilters = this.usedFilters.filter((filter: UsedFilter) =>
      filter.type !== type
      && filter.index !== index
      && filter.childIndex !== childIndex);

    this.onSubmit();
  }

  setAvailableFilters(searchFilters: SearchFilters): void {
    const searchParams: SearchParams = JSON.parse(sessionStorage.getItem(environment.searchParams));

    // this.usedFilters = [];
    this.languagesArray.clear();
    this.subjectsArray.clear();
    this.teachesArray.clear();
    this.authorsArray.clear();
    this.organizationsArray.clear();
    this.educationalRolesArray.clear();
    this.keywordsArray.clear();

    this.filtersShown.set('languages', this.filtersShownAtFirst);
    this.filtersShown.set('subjects', this.filtersShownAtFirst);
    this.filtersShown.set('teaches', this.filtersShownAtFirst);
    this.filtersShown.set('authors', this.filtersShownAtFirst);
    this.filtersShown.set('organizations', this.filtersShownAtFirst);
    this.filtersShown.set('roles', this.filtersShownAtFirst);
    this.filtersShown.set('keywords', this.filtersShownAtFirst);

    // languages
    searchFilters.languages.forEach((language: string, index: number) => {
      let state = false;

      if (searchParams?.filters?.languages) {
        state = searchParams.filters.languages.includes(language);

        if (state) {
          this.usedFilters.push({
            key: language,
            value: this.getLanguageLabel(language),
            type: 'language',
            index: index,
          });
        }
      }

      this.languagesArray.push(this.fb.control(state));
    });

    // levels
    this.filters.value.educationalLevels
      .forEach((level, index: number) => {
        level.levels.forEach((checked: boolean, childIndex: number) => {
          if (checked) {
            this.usedFilters.push({
              key: this.educationalLevels[index].children[childIndex].key,
              value: this.educationalLevels[index].children[childIndex].value,
              type: 'level',
              index: index,
              childIndex: childIndex,
            });
          }
        });
      });

    // subjects
    searchFilters.subjects.forEach((subject: SearchFilterEducationalSubject, index: number) => {
      let state = false;

      if (searchParams?.filters?.educationalSubjects) {
        state = searchParams.filters.educationalSubjects.includes(subject.key);

        if (state) {
          this.usedFilters.push({
            key: subject.key,
            value: subject.value,
            type: 'subject',
            index: index,
          });
        }
      }

      this.subjectsArray.push(this.fb.control(state));
    });

    // teaches
    searchFilters.teaches.forEach((teach, index: number) => {
      let state = false;

      if (searchParams?.filters?.teaches) {
        state = searchParams.filters.teaches.includes(teach.key);

        if (state) {
          this.usedFilters.push({
            key: teach.key,
            value: teach.value,
            type: 'teach',
            index: index,
          });
        }
      }

      this.teachesArray.push(this.fb.control(state));

      this.teachesTruncates.set(index, teach.value.length >= 60 ? 60 : teach.value.length);
    });

    // types
    this.filters.value.learningResourceTypes
      .forEach((checked: boolean, index: number) => {
        if (checked) {
          this.usedFilters.push({
            key: this.learningResourceTypes[index].key,
            value: this.learningResourceTypes[index].value,
            type: 'type',
            index: index,
          });
        }
      });

    // authors
    searchFilters.authors.forEach((author: string, index: number) => {
      let state = false;

      if (searchParams?.filters?.authors) {
        state = searchParams.filters.authors.includes(author);

        if (state) {
          this.usedFilters.push({
            key: author,
            value: author,
            type: 'author',
            index: index,
          });
        }
      }

      this.authorsArray.push(this.fb.control(state));
    });

    // organizations
    searchFilters.organizations.forEach((organization, index: number) => {
      let state = false;

      if (searchParams?.filters?.organizations) {
        state = searchParams.filters.organizations.includes(organization.key);

        if (state) {
          this.usedFilters.push({
            key: organization.key,
            value: organization.value,
            type: 'organization',
            index: index,
          });
        }
      }

      this.organizationsArray.push(this.fb.control(state));
    });

    // roles
    searchFilters.roles.forEach((role, index: number) => {
      let state = false;

      if (searchParams?.filters?.educationalRoles) {
        state = searchParams.filters.educationalRoles.includes(role.key);

        if (state) {
          this.usedFilters.push({
            key: role.key,
            value: role.value,
            type: 'role',
            index: index,
          });
        }
      }

      this.educationalRolesArray.push(this.fb.control(state));
    });

    // keywords
    searchFilters.keywords.forEach((keyword, index: number) => {
      let state = false;

      if (searchParams?.filters?.keywords) {
        state = searchParams.filters.keywords.includes(keyword.key);

        if (state) {
          this.usedFilters.push({
            key: keyword.key,
            value: keyword.value,
            type: 'keyword',
            index: index,
          });
        }
      }

      this.keywordsArray.push(this.fb.control(state));
    });
  }

  getPage(pageNumber: number): void {
    if (this.searchForm.valid) {
      this.resultsContainer.nativeElement.scrollIntoView();
      this.loading = true;
      this.page = pageNumber;

      const searchParams: SearchParams = JSON.parse(sessionStorage.getItem(environment.searchParams));
      searchParams.from = this.from;
      searchParams.size = this.resultsPerPage;

      this.searchSvc.updateSearchResults(searchParams);

      this.setTitle();
    }
  }

  /**
   * Finds key matching language value.
   * @param {string} key
   * @returns {string} value
   */
  getLanguageLabel(key: string): string {
    return this.allLanguages.find((lang: Language) => lang.key === key).value;
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      const searchParams: SearchParams = this.searchForm.value;
      const selectedEducationalLevels: string[] = [];

      searchParams.from = 0;
      searchParams.size = this.resultsPerPage;

      searchParams.filters.languages = this.filters.value.languages
        .map((checked: boolean, index: number) => checked ? this.searchFilters.languages[index] : null)
        .filter((language: string) => language !== null);

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
        .map((checked: boolean, index: number) => checked ? this.searchFilters.authors[index] : null)
        .filter((value: string) => value !== null);

      searchParams.filters.organizations = this.filters.value.organizations
        .map((checked: boolean, index: number) => checked ? this.searchFilters.organizations[index].key : null)
        .filter((value: string) => value !== null);

      searchParams.filters.educationalRoles = this.filters.value.educationalRoles
        .map((checked: boolean, index: number) => checked ? this.searchFilters.roles[index].key : null)
        .filter((value: string) => value !== null);

      searchParams.filters.keywords = this.filters.value.keywords
        .map((checked: boolean, index: number) => checked ? this.searchFilters.keywords[index].key : null)
        .filter((value: string) => value !== null);

      searchParams.filters.educationalSubjects = this.filters.value.educationalSubjects
        .map((checked: boolean, index: number) => checked ? this.searchFilters.subjects[index].key : null)
        .filter((subject: string) => subject !== null);

      searchParams.filters.teaches = this.filters.value.teaches
        .map((checked: boolean, index: number) => checked ? this.searchFilters.teaches[index].key : null)
        .filter((teach: string) => teach !== null);

      this.searchSvc.updateSearchResults(searchParams);
      this.searchSvc.updateSearchFilters(searchParams);

      this.page = 1;
    }
  }
}
