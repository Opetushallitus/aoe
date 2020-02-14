import { Component, OnDestroy, OnInit } from '@angular/core';
import { SearchService } from '@services/search.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { EducationalLevel } from '@models/koodisto-proxy/educational-level';
import { LearningResourceType } from '@models/koodisto-proxy/learning-resource-type';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { TranslateService } from '@ngx-translate/core';

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
  educationalSubjects: any[]; // @todo: add proper model
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
      // @todo: this.koodistoProxySvc.updateEducationalSubjects();
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

    // @todo: this.educationalSubjectSubscription.subscribe();
    // @todo: this.koodistoProxySvc.updateEducationalSubjects();

    this.learningResourceTypeSubscription = this.koodistoProxySvc.learningResourceTypes$
      .subscribe((types: LearningResourceType[]) => {
        this.learningResourceTypes = types;
      });
    this.koodistoProxySvc.updateLearningResourceTypes();
  }

  ngOnDestroy(): void {
    this.educationalLevelSubscription.unsubscribe();
    // @todo: this.educationalSubjectSubscription.unsubscribe();
    this.learningResourceTypeSubscription.unsubscribe();
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      this.searchSvc.updateSearchResults(this.searchForm.value);

      this.router.navigate(['/haku']);
    }
  }
}
