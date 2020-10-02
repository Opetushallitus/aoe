import { Component, OnDestroy, OnInit } from '@angular/core';
import { SearchService } from '@services/search.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { EducationalLevel } from '@models/koodisto-proxy/educational-level';
import { LearningResourceType } from '@models/koodisto-proxy/learning-resource-type';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { TranslateService } from '@ngx-translate/core';
import { SubjectFilter } from '@models/koodisto-proxy/subject-filter';
import { SearchParams } from '@models/search/search-params';
import { environment } from '../../../environments/environment';
import { UsedFilter } from '@models/search/used-filter';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  educationalLevelSubscription: Subscription;
  educationalLevels: EducationalLevel[];
  educationalSubjectSubscription: Subscription;
  educationalSubjects: SubjectFilter[];
  learningResourceTypeSubscription: Subscription;
  learningResourceTypes: LearningResourceType[];
  resultsPerPage = 15;

  constructor(
    private searchSvc: SearchService,
    private fb: FormBuilder,
    private router: Router,
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
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
        learningResourceTypes: this.fb.control(null),
      }),
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
      });
    this.koodistoProxySvc.updateLearningResourceTypes();
  }

  ngOnDestroy(): void {
    this.educationalLevelSubscription.unsubscribe();
    this.educationalSubjectSubscription.unsubscribe();
    this.learningResourceTypeSubscription.unsubscribe();
  }

  get filters(): FormControl {
    return this.searchForm.get('filters') as FormControl;
  }

  get educationalLevelsCtrl(): FormControl {
    return this.filters.get('educationalLevels') as FormControl;
  }

  get educationalSubjectsCtrl(): FormControl {
    return this.filters.get('educationalSubjects') as FormControl;
  }

  get learningResourceTypesCtrl(): FormControl {
    return this.filters.get('learningResourceTypes') as FormControl;
  }

  educationLevelChange(): void {
    if (this.educationalLevelsCtrl.value.length > 0) {
      const educationLevelKeys = this.educationalLevelsCtrl.value?.map((level) => level.key);

      this.educationalSubjects = this.educationalSubjects
        .filter((subject: SubjectFilter) => educationLevelKeys.includes(subject.key));
    } else {
      this.koodistoProxySvc.updateSubjectFilters();
    }
  }

  setUsedFilters(): void {
    const usedFilters: UsedFilter[] = [];

    this.educationalLevelsCtrl.value?.forEach((level) => {
      usedFilters.push({
        key: level.key,
        value: level.value,
        type: 'level',
      });
    });

    this.educationalSubjectsCtrl.value?.forEach((subject) => {
      usedFilters.push({
        key: subject.key.toString(),
        value: subject.value,
        type: 'subject',
      });
    });

    this.learningResourceTypesCtrl.value?.forEach((type) => {
      usedFilters.push({
        key: type.key,
        value: type.value,
        type: 'type',
      });
    });

    sessionStorage.setItem(environment.usedFilters, JSON.stringify(usedFilters));
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      this.setUsedFilters();

      const searchParams: SearchParams = {
        keywords: null,
        filters: {},
      };

      searchParams.filters.educationalLevels = this.educationalLevelsCtrl.value?.map((level) => level.key);
      searchParams.filters.educationalSubjects = this.educationalSubjectsCtrl.value?.map((subject) => subject.key.toString());
      searchParams.filters.learningResourceTypes = this.learningResourceTypesCtrl.value?.map((type) => type.key);
      searchParams.from = 0;
      searchParams.size = this.resultsPerPage;

      sessionStorage.setItem(environment.searchParams, JSON.stringify(searchParams));

      this.router.navigate(['/haku']);
    }
  }
}
