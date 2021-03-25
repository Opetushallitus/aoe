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
import { DeviceDetectorService } from 'ngx-device-detector';
import { UsedFilter } from '@models/search/used-filter';
import { sortOptions } from '../../constants/sort-options';

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
  pages = 0;
  resultsPerPage = 15;
  loading: boolean;
  @ViewChild('resultsContainer') resultsContainer: ElementRef;

  // filters
  searchFilters: SearchFilters;
  searchFilterSubscription: Subscription;
  filtersShownAtFirst = 8;
  filtersShown = new Map();
  isCollapsedFilters = false;
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
  isCollapsedUses = true;
  showAllUses = true;
  isCollapsedHazards = true;
  showAllHazards = true;
  isCollapsedFeatures = true;
  showAllFeatures = true;
  isCollapsedLicenses = true;
  showAllLicenses = true;
  usedFilters: UsedFilter[] = [];
  sortOptions = sortOptions;

  constructor(
    private searchSvc: SearchService,
    private fb: FormBuilder,
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
    private titleSvc: Title,
    private deviceSvc: DeviceDetectorService,
  ) { }

  ngOnInit() {
    this.setTitle();

    if (this.deviceSvc.isMobile()) {
      this.isCollapsedFilters = true;
    }

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
        educationalUses: this.fb.array([]),
        accessibilityHazards: this.fb.array([]),
        accessibilityFeatures: this.fb.array([]),
        licenses: this.fb.array([]),
      }),
      sort: this.fb.control('relevance'),
      sort2: this.fb.control('relevance'),
    });

    const searchParams: SearchParams = JSON.parse(sessionStorage.getItem(environment.searchParams));

    if (searchParams) {
      this.keywordsCtrl.setValue(searchParams.keywords);
    }

    this.usedFilters = JSON.parse(sessionStorage.getItem(environment.usedFilters));
    this.searchSvc.updateSearchResults(searchParams);
    this.searchSvc.updateSearchFilters(searchParams);

    this.resultSubscription = this.searchSvc.searchResults$
      .subscribe((results: SearchResults) => {
        this.results = results;
        this.loading = false;

        if (results.hits > 0) {
          this.searchSvc.updateSearchFilters(JSON.parse(sessionStorage.getItem(environment.searchParams)));

          this.pages = Math.ceil(this.results.hits / this.resultsPerPage);
          this.setTitle();
        }
      });

    this.languageSubscription = this.koodistoProxySvc.languages$.subscribe((languages: Language[]) => {
      this.allLanguages = languages;
    });
    this.koodistoProxySvc.updateLanguages();

    this.educationalLevelSubscription = this.koodistoProxySvc.educationalLevels$
      .subscribe((levels: EducationalLevel[]) => {
        this.educationalLevels = levels;

        this.educationalLevelsArray.clear();

        this.educationalLevels.forEach((level: EducationalLevel) => {
          const children = this.fb.array([]);

          level.children.forEach((child) => {
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

        this.learningResourceTypes.forEach((type: LearningResourceType) => {
          let state = false;

          if (searchParams?.filters?.learningResourceTypes) {
            state = searchParams.filters.learningResourceTypes.includes(type.key);
          }

          this.learningResourceTypesArray.push(this.fb.control(state));
        });
      });
    this.koodistoProxySvc.updateLearningResourceTypes();

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
      this.showAllUses = this.usesArray.controls.length > this.filtersShownAtFirst;
      this.showAllHazards = this.hazardsArray.controls.length > this.filtersShownAtFirst;
      this.showAllFeatures = this.featuresArray.controls.length > this.filtersShownAtFirst;
      this.showAllLicenses = this.licensesArray.controls.length > this.filtersShownAtFirst;
    });

    // keep both controls in sync
    this.sortCtrl.valueChanges.subscribe((value) => this.sort2Ctrl.setValue(value, { emitEvent: false }));
    this.sort2Ctrl.valueChanges.subscribe((value) => this.sortCtrl.setValue(value, { emitEvent: false }));
  }

  ngOnDestroy(): void {
    this.resultSubscription.unsubscribe();
    this.languageSubscription.unsubscribe();
    this.educationalLevelSubscription.unsubscribe();
    this.learningResourceTypeSubscription.unsubscribe();
    this.searchFilterSubscription.unsubscribe();
  }

  setTitle(): void {
    this.translate.get('titles.searchResults').subscribe((title: string) => {
      this.titleSvc.setTitle(`${title} ${this.page}/${this.pages} ${environment.title}`);
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
      + this.teachesCount
      + this.usesCount
      + this.hazardsCount
      + this.featuresCount
      + this.licensesCount;
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

  get usesArray(): FormArray {
    return this.filters.get('educationalUses') as FormArray;
  }

  get usesCount(): number {
    return this.usesArray.value.filter((v: boolean) => v === true).length;
  }

  get hazardsArray(): FormArray {
    return this.filters.get('accessibilityHazards') as FormArray;
  }

  get hazardsCount(): number {
    return this.hazardsArray.value.filter((v: boolean) => v === true).length;
  }

  get featuresArray(): FormArray {
    return this.filters.get('accessibilityFeatures') as FormArray;
  }

  get featuresCount(): number {
    return this.featuresArray.value.filter((v: boolean) => v === true).length;
  }

  get licensesArray(): FormArray {
    return this.filters.get('licenses') as FormArray;
  }

  get licensesCount(): number {
    return this.licensesArray.value.filter((v: boolean) => v === true).length;
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

  get sortCtrl(): FormControl {
    return this.searchForm.get('sort') as FormControl;
  }

  get sort2Ctrl(): FormControl {
    return this.searchForm.get('sort2') as FormControl;
  }

  setAvailableFilters(searchFilters: SearchFilters): void {
    const searchParams: SearchParams = JSON.parse(sessionStorage.getItem(environment.searchParams));

    this.languagesArray.clear();
    this.subjectsArray.clear();
    this.teachesArray.clear();
    this.authorsArray.clear();
    this.organizationsArray.clear();
    this.educationalRolesArray.clear();
    this.keywordsArray.clear();
    this.usesArray.clear();
    this.hazardsArray.clear();
    this.featuresArray.clear();
    this.licensesArray.clear();

    this.filtersShown.set('languages', this.filtersShownAtFirst);
    this.filtersShown.set('subjects', this.filtersShownAtFirst);
    this.filtersShown.set('teaches', this.filtersShownAtFirst);
    this.filtersShown.set('authors', this.filtersShownAtFirst);
    this.filtersShown.set('organizations', this.filtersShownAtFirst);
    this.filtersShown.set('roles', this.filtersShownAtFirst);
    this.filtersShown.set('keywords', this.filtersShownAtFirst);
    this.filtersShown.set('uses', this.filtersShownAtFirst);
    this.filtersShown.set('hazards', this.filtersShownAtFirst);
    this.filtersShown.set('features', this.filtersShownAtFirst);
    this.filtersShown.set('licenses', this.filtersShownAtFirst);

    // languages
    searchFilters.languages.forEach((language: string) => {
      let state = false;

      if (searchParams?.filters?.languages) {
        state = searchParams.filters.languages.includes(language);
      }

      this.languagesArray.push(this.fb.control(state));
    });

    // levels
    this.educationalLevels?.forEach((level: EducationalLevel, index: number) => {
      level.children.forEach((child: EducationalLevel, childIndex: number) => {
        const levels = <FormArray>this.educationalLevelsArray.controls[index].get('levels');

        levels.at(childIndex).setValue(searchParams?.filters?.educationalLevels?.includes(child.key));
      });
    });

    // subjects
    searchFilters.subjects.forEach((subject: SearchFilterEducationalSubject) => {
      let state = false;

      if (searchParams?.filters?.educationalSubjects) {
        state = searchParams.filters.educationalSubjects.includes(subject.key);
      }

      this.subjectsArray.push(this.fb.control(state));
    });

    // teaches
    searchFilters.teaches.forEach((teach, index: number) => {
      let state = false;

      if (searchParams?.filters?.teaches) {
        state = searchParams.filters.teaches.includes(teach.key);
      }

      this.teachesArray.push(this.fb.control(state));

      this.teachesTruncates.set(index, teach.value.length >= 60 ? 60 : teach.value.length);
    });

    // types
    this.learningResourceTypes?.forEach((type: LearningResourceType, index: number) => {
      this.learningResourceTypesArray.at(index).setValue(searchParams?.filters?.learningResourceTypes?.includes(type.key));
    });

    // authors
    searchFilters.authors.forEach((author: string) => {
      let state = false;

      if (searchParams?.filters?.authors) {
        state = searchParams.filters.authors.includes(author);
      }

      this.authorsArray.push(this.fb.control(state));
    });

    // organizations
    searchFilters.organizations.forEach((organization) => {
      let state = false;

      if (searchParams?.filters?.organizations) {
        state = searchParams.filters.organizations.includes(organization.key);
      }

      this.organizationsArray.push(this.fb.control(state));
    });

    // roles
    searchFilters.roles.forEach((role) => {
      let state = false;

      if (searchParams?.filters?.educationalRoles) {
        state = searchParams.filters.educationalRoles.includes(role.key);
      }

      this.educationalRolesArray.push(this.fb.control(state));
    });

    // keywords
    searchFilters.keywords.forEach((keyword) => {
      let state = false;

      if (searchParams?.filters?.keywords) {
        state = searchParams.filters.keywords.includes(keyword.key);
      }

      this.keywordsArray.push(this.fb.control(state));
    });

    // uses
    searchFilters.uses.forEach((use) => {
      let state = false;

      if (searchParams?.filters?.educationalUses) {
        state = searchParams.filters.educationalUses.includes(use.key);
      }

      this.usesArray.push(this.fb.control(state));
    });

    // hazards
    searchFilters.hazards.forEach((hazard) => {
      let state = false;

      if (searchParams?.filters?.accessibilityHazards) {
        state = searchParams.filters.accessibilityHazards.includes(hazard.key);
      }

      this.hazardsArray.push(this.fb.control(state));
    });

    // features
    searchFilters.features.forEach((feature) => {
      let state = false;

      if (searchParams?.filters?.accessibilityFeatures) {
        state = searchParams.filters.accessibilityFeatures.includes(feature.key);
      }

      this.featuresArray.push(this.fb.control(state));
    });

    // licenses
    searchFilters.licenses.forEach((license) => {
      let state = false;

      if (searchParams?.filters?.licenses) {
        state = searchParams.filters.licenses.includes(license.key);
      }

      this.licensesArray.push(this.fb.control(state));
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

  onSubmit(removedFilter?: UsedFilter): void {
    if (this.searchForm.valid) {
      const searchParams: SearchParams = this.searchForm.value;
      const selectedEducationalLevels: string[] = [];
      let usedFilters: UsedFilter[] = [];

      searchParams.from = 0;
      searchParams.size = this.resultsPerPage;

      delete searchParams.sort2;

      searchParams.filters.languages = this.filters.value.languages
        .map((checked: boolean, index: number) => {
          if (checked) {
            usedFilters.push({
              key: this.searchFilters.languages[index],
              value: this.getLanguageLabel(this.searchFilters.languages[index]),
              type: 'language',
            });

            return this.searchFilters.languages[index];
          }

          return null;
        })
        .filter((language: string) => language !== null);

      this.educationalLevelsArray.value
        .forEach((level, index: number) => {
          level.levels.forEach((checked: boolean, childIndex: number) => {
            if (checked) {
              selectedEducationalLevels.push(this.educationalLevels[index].children[childIndex].key);

              usedFilters.push({
                ...this.educationalLevels[index].children[childIndex],
                type: 'educationalLevels',
              });
            }
          });
        });

      searchParams.filters.educationalLevels = selectedEducationalLevels;

      searchParams.filters.learningResourceTypes = this.learningResourceTypesArray.value
        .map((checked: boolean, index: number) => {
          if (checked) {
            usedFilters.push({
              key: this.learningResourceTypes[index].key,
              value: this.learningResourceTypes[index].value,
              type: 'learningResourceTypes',
            });

            return this.learningResourceTypes[index].key;
          }

          return null;
        })
        .filter((value: string) => value !== null);

      searchParams.filters.authors = this.filters.value.authors
        .map((checked: boolean, index: number) => {
          if (checked) {
            usedFilters.push({
              key: this.searchFilters.authors[index],
              value: this.searchFilters.authors[index],
              type: 'author',
            });

            return this.searchFilters.authors[index];
          }

          return null;
        })
        .filter((value: string) => value !== null);

      searchParams.filters.organizations = this.filters.value.organizations
        .map((checked: boolean, index: number) => {
          if (checked) {
            usedFilters.push({
              key: this.searchFilters.organizations[index].key,
              value: this.searchFilters.organizations[index].value,
              type: 'organization',
            });

            return this.searchFilters.organizations[index].key;
          }

          return null;
        })
        .filter((value: string) => value !== null);

      searchParams.filters.educationalRoles = this.filters.value.educationalRoles
        .map((checked: boolean, index: number) => {
          if (checked) {
            usedFilters.push({
              key: this.searchFilters.roles[index].key,
              value: this.searchFilters.roles[index].value,
              type: 'role',
            });

            return this.searchFilters.roles[index].key;
          }

          return null;
        })
        .filter((value: string) => value !== null);

      searchParams.filters.keywords = this.filters.value.keywords
        .map((checked: boolean, index: number) => {
          if (checked) {
            usedFilters.push({
              key: this.searchFilters.keywords[index].key,
              value: this.searchFilters.keywords[index].value,
              type: 'keyword',
            });

            return this.searchFilters.keywords[index].key;
          }

          return null;
        })
        .filter((value: string) => value !== null);

      searchParams.filters.educationalSubjects = this.filters.value.educationalSubjects
        .map((checked: boolean, index: number) => {
          if (checked) {
            usedFilters.push({
              key: this.searchFilters.subjects[index].key.toString(),
              value: this.searchFilters.subjects[index].value,
              type: 'educationalSubjects',
            });

            return this.searchFilters.subjects[index].key.toString();
          }

          return null;
        })
        .filter((subject: string) => subject !== null);

      searchParams.filters.teaches = this.filters.value.teaches
        .map((checked: boolean, index: number) => {
          if (checked) {
            usedFilters.push({
              key: this.searchFilters.teaches[index].key,
              value: this.searchFilters.teaches[index].value,
              type: 'teach',
            });

            return this.searchFilters.teaches[index].key;
          }

          return null;
        })
        .filter((teach: string) => teach !== null);

      searchParams.filters.educationalUses = this.filters.value.educationalUses
        .map((checked: boolean, index: number) => {
          if (checked) {
            usedFilters.push({
              key: this.searchFilters.uses[index].key,
              value: this.searchFilters.uses[index].value,
              type: 'use',
            });

            return this.searchFilters.uses[index].key;
          }

          return null;
        })
        .filter((use: string) => use !== null);

      searchParams.filters.accessibilityHazards = this.filters.value.accessibilityHazards
        .map((checked: boolean, index: number) => {
          if (checked) {
            usedFilters.push({
              key: this.searchFilters.hazards[index].key,
              value: this.searchFilters.hazards[index].value,
              type: 'hazard',
            });

            return this.searchFilters.hazards[index].key;
          }

          return null;
        })
        .filter((hazard: string) => hazard !== null);

      searchParams.filters.accessibilityFeatures = this.filters.value.accessibilityFeatures
        .map((checked: boolean, index: number) => {
          if (checked) {
            usedFilters.push({
              key: this.searchFilters.features[index].key,
              value: this.searchFilters.features[index].value,
              type: 'feature',
            });

            return this.searchFilters.features[index].key;
          }

          return null;
        })
        .filter((feature: string) => feature !== null);

      searchParams.filters.licenses = this.filters.value.licenses
        .map((checked: boolean, index: number) => {
          if (checked) {
            usedFilters.push({
              key: this.searchFilters.licenses[index].key,
              value: this.searchFilters.licenses[index].value,
              type: 'license',
            });

            return this.searchFilters.licenses[index].key;
          }

          return null;
        })
        .filter((license: string) => license !== null);

      if (removedFilter) {
        switch (removedFilter.type) {
          case 'language':
            searchParams.filters.languages = searchParams.filters.languages
              .filter((lang: string) => lang !== removedFilter.key);
            break;

          case 'educationalLevels':
            searchParams.filters.educationalLevels = searchParams.filters.educationalLevels
              .filter((level: string) => level !== removedFilter.key);
            break;

          case 'educationalSubjects':
            searchParams.filters.educationalSubjects = searchParams.filters.educationalSubjects
              .filter((subject: string) => subject !== removedFilter.key);
            break;

          case 'teach':
            searchParams.filters.teaches = searchParams.filters.teaches
              .filter((teach: string) => teach !== removedFilter.key);
            break;

          case 'learningResourceTypes':
            searchParams.filters.learningResourceTypes = searchParams.filters.learningResourceTypes
              .filter((type: string) => type !== removedFilter.key);
            break;

          case 'author':
            searchParams.filters.authors = searchParams.filters.authors
              .filter((author: string) => author !== removedFilter.key);
            break;

          case 'organization':
            searchParams.filters.organizations = searchParams.filters.organizations
              .filter((organization: string) => organization !== removedFilter.key);
            break;

          case 'role':
            searchParams.filters.educationalRoles = searchParams.filters.educationalRoles
              .filter((role: string) => role !== removedFilter.key);
            break;

          case 'keyword':
            searchParams.filters.keywords = searchParams.filters.keywords
              .filter((keyword: string) => keyword !== removedFilter.key);
            break;

          case 'use':
            searchParams.filters.educationalUses = searchParams.filters.educationalUses
              .filter((use: string) => use !== removedFilter.key);
            break;

          case 'hazard':
            searchParams.filters.accessibilityHazards = searchParams.filters.accessibilityHazards
              .filter((hazard: string) => hazard !== removedFilter.key);
            break;

          case 'feature':
            searchParams.filters.accessibilityFeatures = searchParams.filters.accessibilityFeatures
              .filter((feature: string) => feature !== removedFilter.key);
            break;

          case 'license':
            searchParams.filters.licenses = searchParams.filters.licenses
              .filter((license: string) => license !== removedFilter.key);
            break;

          default:
            break;
        }

        usedFilters = usedFilters.filter((filter: UsedFilter) => filter.key !== removedFilter.key);
      }

      this.usedFilters = usedFilters;
      sessionStorage.setItem(environment.usedFilters, JSON.stringify(usedFilters));

      this.searchSvc.updateSearchResults(searchParams);

      this.page = 1;
    }
  }

  filterSearch(): void {
    const searchParams: SearchParams = JSON.parse(sessionStorage.getItem(environment.searchParams));

    this.educationalLevels.forEach((level: EducationalLevel, index: number) => {
      level.children.forEach((child: EducationalLevel, childIndex: number) => {
        if (searchParams.filters.educationalLevels.includes(child.key)) {
          const levels = <FormArray>this.educationalLevelsArray.controls[index].get('levels');
          levels.at(childIndex).setValue(true);
        }
      });
    });

    this.usedFilters = JSON.parse(sessionStorage.getItem(environment.usedFilters));
    this.searchSvc.updateSearchResults(searchParams);
    this.page = 1;
  }
}
