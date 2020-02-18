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

  educationLevelChange(): void {
    if (this.educationalLevelsCtrl.value.length > 0) {
      this.educationalSubjects = this.educationalSubjects
        .filter((subject: SubjectFilter) => this.educationalLevelsCtrl.value.includes(subject.key));
    } else {
      this.koodistoProxySvc.updateSubjectFilters();
    }
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      this.searchSvc.updateSearchResults(this.searchForm.value);

      this.router.navigate(['/haku']);
    }
  }
}
