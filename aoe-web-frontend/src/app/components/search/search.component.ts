import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { ToastrService } from 'ngx-toastr'
import { Subscription } from 'rxjs'
import { environment } from '@environments/environment'
import { textInputValidator } from '@shared/shared.module'
import { KoodistoService } from '@services/koodisto.service'
import { SubjectFilter } from '@models/koodisto/subject-filter'
import { SearchParams } from '@models/search/search-params'
import { EducationalLevel } from '@models/koodisto/educational-level'
import { LearningResourceType } from '@models/koodisto/learning-resource-type'
import { UsedFilter } from '@models/search/used-filter'
import { sortOptions } from '@constants/sort-options'
import { validatorParams } from '@constants/validator-params'

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  searchForm: FormGroup = new FormGroup({})
  educationalLevelSubscription = new Subscription()
  educationalLevels: EducationalLevel[] = []
  educationalSubjectSubscription = new Subscription()
  educationalSubjects: SubjectFilter[] = []
  learningResourceTypeSubscription = new Subscription()
  learningResourceTypes: LearningResourceType[] = []
  resultsPerPage = 15

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private koodistoProxySvc: KoodistoService,
    private translate: TranslateService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.translate.onLangChange.subscribe(() => {
      this.koodistoProxySvc.updateEducationalLevels()
      this.koodistoProxySvc.updateEducationalSubjects()
      this.koodistoProxySvc.updateLearningResourceTypes()
    })

    this.searchForm = this.fb.group({
      keywords: this.fb.control(null, [
        Validators.maxLength(validatorParams.keywords.maxLength),
        textInputValidator()
      ]),
      filters: this.fb.group({
        educationalLevels: this.fb.control(null, Validators.maxLength(10)),
        educationalSubjects: this.fb.control(null, Validators.maxLength(10)),
        learningResourceTypes: this.fb.control(null, Validators.maxLength(10))
      })
    })

    this.educationalLevelSubscription = this.koodistoProxySvc.educationalLevelsEnabled$.subscribe(
      (levels: EducationalLevel[]) => {
        this.educationalLevels = levels
      }
    )
    this.koodistoProxySvc.updateEducationalLevels()

    this.educationalSubjectSubscription = this.koodistoProxySvc.educationalSubject$.subscribe(
      (filters: SubjectFilter[]) => {
        this.educationalSubjects = filters
      }
    )
    this.koodistoProxySvc.updateEducationalSubjects()

    this.learningResourceTypeSubscription = this.koodistoProxySvc.learningResourceTypes$.subscribe(
      (types: LearningResourceType[]) => {
        this.learningResourceTypes = types
      }
    )
    this.koodistoProxySvc.updateLearningResourceTypes()
  }

  ngOnDestroy(): void {
    this.educationalLevelSubscription.unsubscribe()
    this.educationalSubjectSubscription.unsubscribe()
    this.learningResourceTypeSubscription.unsubscribe()
  }

  get keywordsCtrl(): FormControl {
    return this.searchForm.get('keywords') as FormControl
  }

  get filters(): FormControl {
    return this.searchForm.get('filters') as FormControl
  }

  get educationalLevelsCtrl(): FormControl {
    return this.filters.get('educationalLevels') as FormControl
  }

  get educationalSubjectsCtrl(): FormControl {
    return this.filters.get('educationalSubjects') as FormControl
  }

  get learningResourceTypesCtrl(): FormControl {
    return this.filters.get('learningResourceTypes') as FormControl
  }

  educationLevelChange(): void {
    if (this.educationalLevelsCtrl.value.length > 0) {
      const educationLevelKeys = this.educationalLevelsCtrl.value?.map(
        (level: Record<string, string | number>) => level.key
      )

      this.educationalSubjects = this.educationalSubjects.filter((subject: SubjectFilter) =>
        educationLevelKeys.includes(subject.key)
      )
    } else {
      this.koodistoProxySvc.updateEducationalSubjects()
    }
  }

  setUsedFilters(): void {
    const usedFilters: UsedFilter[] = []

    this.educationalLevelsCtrl.value?.forEach((level: Record<string | number, string>) => {
      usedFilters.push({
        key: level.key,
        value: level.value,
        type: 'educationalLevels'
      })
    })

    this.educationalSubjectsCtrl.value?.forEach((subject: Record<string | number, string>) => {
      usedFilters.push({
        key: subject.key.toString(),
        value: subject.value,
        type: 'educationalSubjects'
      })
    })

    this.learningResourceTypesCtrl.value?.forEach((type: Record<string | number, string>) => {
      usedFilters.push({
        key: type.key,
        value: type.value,
        type: 'learningResourceTypes'
      })
    })

    sessionStorage.setItem(environment.usedFilters, JSON.stringify(usedFilters))
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      this.setUsedFilters()

      const searchParams: SearchParams = {
        keywords: null,
        filters: {
          languages: [],
          teaches: [],
          learningResourceTypes: [],
          accessibilityFeatures: [],
          accessibilityHazards: [],
          authors: [],
          educationalLevels: [],
          educationalRoles: [],
          educationalSubjects: [],
          educationalUses: [],
          keywords: [],
          licenses: [],
          organizations: []
        }
      }

      searchParams.keywords = this.keywordsCtrl.value
      searchParams.filters.educationalLevels =
        this.educationalLevelsCtrl.value?.map(
          (level: Record<string | number, string>) => level.key
        ) ?? []
      searchParams.filters.educationalSubjects =
        this.educationalSubjectsCtrl.value?.map((subject: Record<string | number, string>) =>
          subject.key.toString()
        ) ?? []
      searchParams.filters.learningResourceTypes =
        this.learningResourceTypesCtrl.value?.map(
          (type: Record<string | number, string>) => type.key
        ) ?? []
      searchParams.sort = sortOptions.relevance.value
      searchParams.from = 0
      searchParams.size = this.resultsPerPage

      sessionStorage.setItem(environment.searchParams, JSON.stringify(searchParams))

      void this.router.navigate(['/haku'])
    } else {
      this.toastr.error('Form not valid')
    }
  }
}
