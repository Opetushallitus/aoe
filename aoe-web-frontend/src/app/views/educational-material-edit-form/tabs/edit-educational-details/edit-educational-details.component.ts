import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { Title } from '@angular/platform-browser'
import { TranslateService } from '@ngx-translate/core'
import { Router } from '@angular/router'
import { Subscription } from 'rxjs'
import {
  addEarlyChildhoodEducationObjective,
  addEarlyChildhoodEducationSubject,
  addPrePrimaryEducationObjective,
  addPrePrimaryEducationSubject,
  addScienceBranchObjectives,
  addSelfMotivatedEducationObjective,
  addSelfMotivatedEducationSubject,
  addUpperSecondarySchoolObjective,
  addVocationalEducationObjective,
  textInputValidator
} from '@shared/shared.module'
import { KoodistoService } from '@services/koodisto.service'
import { educationalLevelKeys } from '@constants/educational-level-keys'
import { validatorParams } from '@constants/validator-params'
import { EducationalMaterialForm } from '@models/educational-material-form'
import { EducationalLevel } from '@models/koodisto/educational-level'
import { AlignmentObjectExtended } from '@models/alignment-object-extended'
import { MaterialService } from '@services/material.service'

@Component({
    selector: 'app-tabs-edit-educational-details',
    templateUrl: './edit-educational-details.component.html',
    styleUrls: ['./edit-educational-details.component.scss'],
    standalone: false
})
export class EditEducationalDetailsComponent implements OnInit, OnDestroy {
  @Input() material: EducationalMaterialForm
  @Input() materialId: number
  @Input() tabId: number
  form: FormGroup
  submitted = false
  educationalLevelSubscription: Subscription
  educationalLevels: EducationalLevel[]
  basicStudySubjectSubscription: Subscription
  basicStudySubjects: AlignmentObjectExtended[]
  basicStudyObjectiveSubscription: Subscription
  basicStudyObjectives: AlignmentObjectExtended[]
  basicStudyContentSubscription: Subscription
  basicStudyContents: AlignmentObjectExtended[]
  preparatoryEducationSubjectSubscription: Subscription
  preparatorySubjects: AlignmentObjectExtended[]
  preparatoryEducationObjectiveSubscription: Subscription
  preparatoryObjectives: AlignmentObjectExtended[]
  upperSecondarySchoolSubjectOldSubscription: Subscription
  upperSecondarySchoolSubjectsOld: AlignmentObjectExtended[]
  upperSecondarySchoolCourseOldSubscription: Subscription
  upperSecondarySchoolCoursesOld: AlignmentObjectExtended[]
  upperSecondarySchoolSubjectNewSubscription: Subscription
  upperSecondarySchoolSubjectsNew: AlignmentObjectExtended[]
  upperSecondarySchoolModuleNewSubscription: Subscription
  upperSecondarySchoolModulesNew: AlignmentObjectExtended[]
  upperSecondarySchoolObjectiveNewSubscription: Subscription
  upperSecondarySchoolObjectivesNew: AlignmentObjectExtended[]
  upperSecondarySchoolContentNewSubscription: Subscription
  upperSecondarySchoolContentsNew: AlignmentObjectExtended[]
  vocationalDegreeSubscription: Subscription
  vocationalDegrees: AlignmentObjectExtended[]
  vocationalUnitSubscription: Subscription
  vocationalUnits: AlignmentObjectExtended[]
  vocationalCommonUnitSubscription: Subscription
  vocationalCommonUnits: AlignmentObjectExtended[]
  vocationalRequirementSubscription: Subscription
  vocationalRequirements: AlignmentObjectExtended[]
  furtherVocationalQualificationSubscription: Subscription
  furtherVocationalQualifications: AlignmentObjectExtended[]
  specialistVocationalQualificationSubscription: Subscription
  specialistVocationalQualifications: AlignmentObjectExtended[]
  scienceBranchSubscription: Subscription
  scienceBranches: AlignmentObjectExtended[]
  hasEarlyChildhoodEducation = false
  hasPrePrimaryEducation = false
  hasBasicStudies = false
  hasBasicStudySubjects = false
  hasPreparatoryEducation = false
  hasPreparatoryEducationSubjects = false
  hasUpperSecondarySchool = false
  hasUpperSecondarySchoolSubjectsOld = false
  hasUpperSecondarySchoolSubjectsNew = false
  hasUpperSecondarySchoolModulesNew = false
  hasVocationalEducation = false
  hasVocationalDegrees = false
  hasVocationalUnits = false
  hasSelfMotivatedEducation = false
  hasHigherEducation = false
  addEarlyChildhoodEducationSubject = addEarlyChildhoodEducationSubject
  addEarlyChildhoodEducationObjective = addEarlyChildhoodEducationObjective
  addPrePrimaryEducationSubject = addPrePrimaryEducationSubject
  addPrePrimaryEducationObjective = addPrePrimaryEducationObjective
  addUpperSecondarySchoolObjective = addUpperSecondarySchoolObjective
  addVocationalEducationObjective = addVocationalEducationObjective
  addSelfMotivatedEducationSubject = addSelfMotivatedEducationSubject
  addSelfMotivatedEducationObjective = addSelfMotivatedEducationObjective
  addScienceBranchObjectives = addScienceBranchObjectives
  @Output() abortEdit: EventEmitter<any> = new EventEmitter()

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private translate: TranslateService,
    private koodistoService: KoodistoService,
    private router: Router,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.setTitle()

    this.form = this.fb.group({
      educationalLevels: this.fb.control(null),
      earlyChildhoodEducationSubjects: this.fb.control(null),
      suitsAllEarlyChildhoodSubjects: this.fb.control(false),
      earlyChildhoodEducationObjectives: this.fb.control(null),
      earlyChildhoodEducationFramework: this.fb.control(null, [
        Validators.maxLength(validatorParams.educationalFramework.maxLength),
        textInputValidator()
      ]),
      prePrimaryEducationSubjects: this.fb.control(null),
      suitsAllPrePrimarySubjects: this.fb.control(false),
      prePrimaryEducationObjectives: this.fb.control(null),
      prePrimaryEducationFramework: this.fb.control(null, [
        Validators.maxLength(validatorParams.educationalFramework.maxLength),
        textInputValidator()
      ]),
      basicStudySubjects: this.fb.control(null),
      suitsAllBasicStudySubjects: this.fb.control(false),
      basicStudyObjectives: this.fb.control(null),
      basicStudyContents: this.fb.control(null),
      basicStudyFramework: this.fb.control(null, [
        Validators.maxLength(validatorParams.educationalFramework.maxLength),
        textInputValidator()
      ]),
      preparatoryEducationSubjects: this.fb.control(null),
      preparatoryEducationObjectives: this.fb.control(null),
      currentUpperSecondarySchoolSelected: this.fb.control(false),
      newUpperSecondarySchoolSelected: this.fb.control(false),
      upperSecondarySchoolSubjectsOld: this.fb.control(null),
      upperSecondarySchoolCoursesOld: this.fb.control(null),
      suitsAllUpperSecondarySubjects: this.fb.control(false),
      upperSecondarySchoolObjectives: this.fb.control(null),
      upperSecondarySchoolSubjectsNew: this.fb.control(null),
      upperSecondarySchoolModulesNew: this.fb.control(null),
      upperSecondarySchoolObjectivesNew: this.fb.control(null),
      upperSecondarySchoolContentsNew: this.fb.control(null),
      suitsAllUpperSecondarySubjectsNew: this.fb.control(false),
      upperSecondarySchoolFramework: this.fb.control(null, [
        Validators.maxLength(validatorParams.educationalFramework.maxLength),
        textInputValidator()
      ]),
      newUpperSecondarySchoolFramework: this.fb.control(null, [
        Validators.maxLength(validatorParams.educationalFramework.maxLength),
        textInputValidator()
      ]),
      vocationalDegrees: this.fb.control(null),
      suitsAllVocationalDegrees: this.fb.control(false),
      vocationalUnits: this.fb.control(null),
      vocationalRequirements: this.fb.control(null),
      vocationalCommonUnits: this.fb.control(null),
      vocationalEducationFramework: this.fb.control(null, [
        Validators.maxLength(validatorParams.educationalFramework.maxLength),
        textInputValidator()
      ]),
      furtherVocationalQualifications: this.fb.control(null),
      specialistVocationalQualifications: this.fb.control(null),
      selfMotivatedEducationSubjects: this.fb.control(null),
      suitsAllSelfMotivatedSubjects: this.fb.control(false),
      selfMotivatedEducationObjectives: this.fb.control(null),
      branchesOfScience: this.fb.control(null),
      suitsAllBranches: this.fb.control(false),
      scienceBranchObjectives: this.fb.control(null),
      higherEducationFramework: this.fb.control(null, [
        Validators.maxLength(validatorParams.educationalFramework.maxLength),
        textInputValidator()
      ])
    })

    this.translate.onLangChange.subscribe(() => {
      this.setTitle()
      this.koodistoService.updateEducationalLevels()
      this.koodistoService.updateBasicStudySubjects()
      this.koodistoService.updatePreparatorySubjects()
      this.koodistoService.updateUpperSecondarySchoolSubjectsOld()
      this.koodistoService.updateUpperSecondarySchoolSubjectsNew()
      this.koodistoService.updateVocationalDegrees()
      this.koodistoService.updateFurtherVocationalQualifications()
      this.koodistoService.updateSpecialistVocationalQualifications()
      this.koodistoService.updateVocationalCommonUnits()
      this.koodistoService.updateScienceBranches()
    })
    if (!this.materialService.getEducationalMaterialEditForm()) {
      this.form.patchValue(this.material)
    } else {
      this.form.patchValue(this.materialService.getEducationalMaterialEditForm())
    }
    if (this.educationalLevelsCtrl.value && this.educationalLevelsCtrl.value.length > 0) {
      this.educationalLevelsChange(this.educationalLevelsCtrl.value)
    }
    if (this.basicStudySubjectsCtrl.value && this.basicStudySubjectsCtrl.value.length > 0) {
      this.basicStudySubjectsChange(this.basicStudySubjectsCtrl.value)
    }
    if (this.preparatoryEducationSubjectsCtrl.value?.length > 0) {
      this.preparatoryEducationSubjectsChange(this.preparatoryEducationSubjectsCtrl.value)
    }
    if (
      this.upperSecondarySchoolSubjectsOldCtrl.value?.length > 0 ||
      this.upperSecondarySchoolCoursesOldCtrl.value?.length > 0
    ) {
      this.currentUpperSecondarySchoolSelected.setValue(true)
    }
    if (this.upperSecondarySchoolSubjectsOldCtrl.value?.length > 0) {
      this.upperSecondarySchoolSubjectsOldChange(this.upperSecondarySchoolSubjectsOldCtrl.value)
    }
    if (
      this.upperSecondarySchoolSubjectsNewCtrl.value &&
      this.upperSecondarySchoolSubjectsNewCtrl.value.length > 0
    ) {
      this.newUpperSecondarySchoolSelected.setValue(true)
      this.upperSecondarySchoolSubjectsNewChange(this.upperSecondarySchoolSubjectsNewCtrl.value)
    }
    if (
      this.upperSecondarySchoolModulesNewCtrl.value &&
      this.upperSecondarySchoolModulesNewCtrl.value.length > 0
    ) {
      this.upperSecondarySchoolModulesNewChange(this.upperSecondarySchoolModulesNewCtrl.value)
    }
    if (
      this.vocationalDegreesCtrl.value?.length > 0 ||
      this.furtherVocationalQualificationsCtrl.value?.length > 0 ||
      this.specialistVocationalQualificationsCtrl.value?.length > 0
    ) {
      this.vocationalDegreesChange()
    }
    if (this.vocationalUnitsCtrl.value?.length > 0) {
      this.vocationalUnitsChange(this.vocationalUnitsCtrl.value)
    }
    // educational levels
    this.educationalLevelSubscription = this.koodistoService.educationalLevels$.subscribe(
      (levels: EducationalLevel[]) => {
        this.educationalLevels = levels
      }
    )
    this.koodistoService.updateEducationalLevels()

    // basic study subjects
    this.basicStudySubjectSubscription = this.koodistoService.basicStudySubjects$.subscribe(
      (subjects: AlignmentObjectExtended[]) => {
        this.basicStudySubjects = subjects
      }
    )
    this.koodistoService.updateBasicStudySubjects()

    // basic study objectives
    this.basicStudyObjectiveSubscription = this.koodistoService.basicStudyObjectives$.subscribe(
      (objectives: AlignmentObjectExtended[]) => {
        this.basicStudyObjectives = objectives
      }
    )

    // basic study contents
    this.basicStudyContentSubscription = this.koodistoService.basicStudyContents$.subscribe(
      (contents: AlignmentObjectExtended[]) => {
        this.basicStudyContents = contents
      }
    )

    //preparatory education
    this.preparatoryEducationSubjectSubscription =
      this.koodistoService.preparatorySubjects$.subscribe((subjects: AlignmentObjectExtended[]) => {
        this.preparatorySubjects = subjects
      })
    this.koodistoService.updatePreparatorySubjects()

    this.preparatoryEducationObjectiveSubscription =
      this.koodistoService.preparatoryObjectives$.subscribe(
        (ojective: AlignmentObjectExtended[]) => {
          this.preparatoryObjectives = ojective
        }
      )

    // upper secondary school subjects (old)
    this.upperSecondarySchoolSubjectOldSubscription =
      this.koodistoService.upperSecondarySchoolSubjectsOld$.subscribe(
        (subjects: AlignmentObjectExtended[]) => {
          this.upperSecondarySchoolSubjectsOld = subjects
        }
      )
    this.koodistoService.updateUpperSecondarySchoolSubjectsOld()

    this.upperSecondarySchoolCourseOldSubscription =
      this.koodistoService.upperSecondarySchoolCoursesOld$.subscribe(
        (courses: AlignmentObjectExtended[]) => {
          this.upperSecondarySchoolCoursesOld = courses
        }
      )

    // upper secondary school subjects (new)
    this.upperSecondarySchoolSubjectNewSubscription =
      this.koodistoService.upperSecondarySchoolSubjectsNew$.subscribe(
        (subjects: AlignmentObjectExtended[]) => {
          this.upperSecondarySchoolSubjectsNew = subjects
        }
      )
    this.koodistoService.updateUpperSecondarySchoolSubjectsNew()

    // upper secondary school modules (new)
    this.upperSecondarySchoolModuleNewSubscription =
      this.koodistoService.upperSecondarySchoolModulesNew$.subscribe(
        (modules: AlignmentObjectExtended[]) => {
          this.upperSecondarySchoolModulesNew = modules
        }
      )

    // upper secondary school objectives (new)
    this.upperSecondarySchoolObjectiveNewSubscription =
      this.koodistoService.upperSecondarySchoolObjectivesNew$.subscribe(
        (objectives: AlignmentObjectExtended[]) => {
          this.upperSecondarySchoolObjectivesNew = objectives
        }
      )

    // upper secondary school contents (new)
    this.upperSecondarySchoolContentNewSubscription =
      this.koodistoService.upperSecondarySchoolContentsNew$.subscribe(
        (contents: AlignmentObjectExtended[]) => {
          this.upperSecondarySchoolContentsNew = contents
        }
      )

    // vocational degrees
    this.vocationalDegreeSubscription = this.koodistoService.vocationalDegrees$.subscribe(
      (degrees: AlignmentObjectExtended[]) => {
        this.vocationalDegrees = degrees
      }
    )
    this.koodistoService.updateVocationalDegrees()

    // vocational units
    this.vocationalUnitSubscription = this.koodistoService.vocationalUnits$.subscribe(
      (units: AlignmentObjectExtended[]) => {
        this.vocationalUnits = units
      }
    )

    //common units
    this.vocationalCommonUnitSubscription = this.koodistoService.vocationalCommonUnits$.subscribe(
      (vocationalCommonUnits: AlignmentObjectExtended[]) => {
        this.vocationalCommonUnits = vocationalCommonUnits
      }
    )
    this.koodistoService.updateVocationalCommonUnits()

    // vocational requirements
    this.vocationalRequirementSubscription = this.koodistoService.vocationalRequirements$.subscribe(
      (requirements: AlignmentObjectExtended[]) => {
        this.vocationalRequirements = requirements
      }
    )

    // further vocational qualifications
    this.furtherVocationalQualificationSubscription =
      this.koodistoService.furtherVocationalQualifications$.subscribe(
        (qualifications: AlignmentObjectExtended[]) => {
          this.furtherVocationalQualifications = qualifications
        }
      )
    this.koodistoService.updateFurtherVocationalQualifications()

    // specialist vocational qualifications
    this.specialistVocationalQualificationSubscription =
      this.koodistoService.specialistVocationalQualifications$.subscribe(
        (qualifications: AlignmentObjectExtended[]) => {
          this.specialistVocationalQualifications = qualifications
        }
      )
    this.koodistoService.updateSpecialistVocationalQualifications()

    // science branches
    this.scienceBranchSubscription = this.koodistoService.scienceBranches$.subscribe(
      (branches: AlignmentObjectExtended[]) => {
        this.scienceBranches = branches
      }
    )
    this.koodistoService.updateScienceBranches()
  }

  ngOnDestroy(): void {
    if (this.submitted === false && this.form.dirty && this.form.valid) {
      this.saveData()
    }

    this.educationalLevelSubscription.unsubscribe()
    this.basicStudySubjectSubscription.unsubscribe()
    this.basicStudyObjectiveSubscription.unsubscribe()
    this.basicStudyContentSubscription.unsubscribe()
    this.preparatoryEducationSubjectSubscription.unsubscribe()
    this.preparatoryEducationObjectiveSubscription.unsubscribe()
    this.upperSecondarySchoolSubjectOldSubscription.unsubscribe()
    this.upperSecondarySchoolCourseOldSubscription.unsubscribe()
    this.upperSecondarySchoolSubjectNewSubscription.unsubscribe()
    this.upperSecondarySchoolModuleNewSubscription.unsubscribe()
    this.upperSecondarySchoolObjectiveNewSubscription.unsubscribe()
    this.upperSecondarySchoolContentNewSubscription.unsubscribe()
    this.vocationalDegreeSubscription.unsubscribe()
    this.vocationalUnitSubscription.unsubscribe()
    this.vocationalCommonUnitSubscription.unsubscribe()
    this.vocationalRequirementSubscription.unsubscribe()
    this.furtherVocationalQualificationSubscription.unsubscribe()
    this.specialistVocationalQualificationSubscription.unsubscribe()
    this.scienceBranchSubscription.unsubscribe()
  }

  setTitle(): void {
    this.translate
      .get(['common.serviceName', 'titles.editMaterial.main', 'titles.editMaterial.education'])
      .subscribe((translations: { [key: string]: string }) => {
        this.titleService.setTitle(
          `${translations['titles.editMaterial.main']}: ${translations['titles.editMaterial.education']} - ${translations['common.serviceName']}`
        )
      })
  }

  get educationalLevelsCtrl(): FormControl {
    return this.form.get('educationalLevels') as FormControl
  }

  get earlyChildhoodEducationFrameworkCtrl(): FormControl {
    return this.form.get('earlyChildhoodEducationFramework') as FormControl
  }

  get prePrimaryEducationFrameworkCtrl(): FormControl {
    return this.form.get('prePrimaryEducationFramework') as FormControl
  }

  get basicStudySubjectsCtrl(): FormControl {
    return this.form.get('basicStudySubjects') as FormControl
  }

  get basicStudyFrameworkCtrl(): FormControl {
    return this.form.get('basicStudyFramework') as FormControl
  }

  get preparatoryEducationSubjectsCtrl(): FormControl {
    return this.form.get('preparatoryEducationSubjects') as FormControl
  }

  get currentUpperSecondarySchoolSelected(): FormControl {
    return this.form.get('currentUpperSecondarySchoolSelected') as FormControl
  }

  get newUpperSecondarySchoolSelected(): FormControl {
    return this.form.get('newUpperSecondarySchoolSelected') as FormControl
  }

  get upperSecondarySchoolSubjectsOldCtrl(): FormControl {
    return this.form.get('upperSecondarySchoolSubjectsOld') as FormControl
  }

  get upperSecondarySchoolCoursesOldCtrl(): FormControl {
    return this.form.get('upperSecondarySchoolCoursesOld') as FormControl
  }

  get upperSecondarySchoolFrameworkCtrl(): FormControl {
    return this.form.get('upperSecondarySchoolFramework') as FormControl
  }

  get upperSecondarySchoolSubjectsNewCtrl(): FormControl {
    return this.form.get('upperSecondarySchoolSubjectsNew') as FormControl
  }

  get upperSecondarySchoolModulesNewCtrl(): FormControl {
    return this.form.get('upperSecondarySchoolModulesNew') as FormControl
  }

  get vocationalDegreesCtrl(): FormControl {
    return this.form.get('vocationalDegrees') as FormControl
  }

  get vocationalUnitsCtrl(): FormControl {
    return this.form.get('vocationalUnits') as FormControl
  }

  get vocationalCommonUnitsCtrl(): FormControl {
    return this.form.get('vocationalCommonUnits') as FormControl
  }

  get vocationalRequirementsCtrl(): FormControl {
    return this.form.get('vocationalRequirements') as FormControl
  }

  get vocationalEducationFrameworkCtrl(): FormControl {
    return this.form.get('vocationalEducationFramework') as FormControl
  }

  get furtherVocationalQualificationsCtrl(): FormControl {
    return this.form.get('furtherVocationalQualifications') as FormControl
  }

  get specialistVocationalQualificationsCtrl(): FormControl {
    return this.form.get('specialistVocationalQualifications') as FormControl
  }

  get higherEducationFrameworkCtrl(): FormControl {
    return this.form.get('higherEducationFramework') as FormControl
  }

  /**
   * Runs on educational levels change. Sets hasX-type educational level boolean values.
   * @param value
   */
  educationalLevelsChange(value: Record<string, unknown>[]): void {
    this.hasEarlyChildhoodEducation =
      value.filter((e: any) => educationalLevelKeys.earlyChildhood.includes(e.key)).length > 0

    this.hasPrePrimaryEducation =
      value.filter((e: any) => educationalLevelKeys.prePrimary.includes(e.key)).length > 0

    this.hasBasicStudies =
      value.filter((e: any) => educationalLevelKeys.basicStudy.includes(e.key)).length > 0

    if (this.hasBasicStudies === false) {
      this.hasBasicStudySubjects = false
    }

    this.hasPreparatoryEducation =
      value.filter((e: any) => educationalLevelKeys.preparatoryEducation.includes(e.key)).length > 0

    this.hasUpperSecondarySchool =
      value.filter((e: any) => educationalLevelKeys.upperSecondary.includes(e.key)).length > 0

    this.hasVocationalEducation =
      value.filter((e: any) => educationalLevelKeys.vocational.includes(e.key)).length > 0

    this.hasSelfMotivatedEducation =
      value.filter((e: any) => educationalLevelKeys.selfMotivated.includes(e.key)).length > 0

    this.hasHigherEducation =
      value.filter((e: any) => educationalLevelKeys.higherEducation.includes(e.key)).length > 0
  }

  /**
   * Runs on basic education subjects change. Sets hasBasicStudySubjects boolean value.
   * Updates basic education objectives and contents based on selected subjects.
   * @param value
   */
  basicStudySubjectsChange(value: AlignmentObjectExtended[]): void {
    this.hasBasicStudySubjects = value.length > 0

    if (this.hasBasicStudySubjects) {
      const ids = value.map((subject: AlignmentObjectExtended) => subject.key).join(',')

      this.koodistoService.updateBasicStudyObjectives(ids)
      this.koodistoService.updateBasicStudyContents(ids)
    }
  }

  /**
   * Runs on preparatory education subjects change. Sets hasPreparatoryEducationSubjects boolean value.
   * Updates preparatory education objectives based on selected subjects.
   * @param value
   */
  preparatoryEducationSubjectsChange(value: AlignmentObjectExtended[]): void {
    this.hasPreparatoryEducationSubjects = value.length > 0

    if (this.hasPreparatoryEducationSubjects) {
      const ids = value.map((degree: AlignmentObjectExtended) => degree.key).join(',')
      this.koodistoService.updatePreparatoryObjectives(ids)
    }
  }

  /**
   * Runs on upper secondary school subject (old) change. Sets hasUpperSecondarySchoolSubjectsOld boolean
   * value. Updates upper secondary school courses based on selected subjects.
   * @param value
   */
  upperSecondarySchoolSubjectsOldChange(value: AlignmentObjectExtended[]): void {
    this.hasUpperSecondarySchoolSubjectsOld = value.length > 0

    if (this.hasUpperSecondarySchoolSubjectsOld) {
      const ids = value.map((subject: AlignmentObjectExtended) => subject.key).join(',')

      this.koodistoService.updateUpperSecondarySchoolCoursesOld(ids)
    }
  }

  /**
   * Runs on upper secondary school subject (new) change. Sets hasUpperSecondarySchoolSubjectsNew boolean
   * value. Updates upper secondary school modules based on selected subjects.
   * @param value
   */
  upperSecondarySchoolSubjectsNewChange(value: AlignmentObjectExtended[]): void {
    this.hasUpperSecondarySchoolSubjectsNew = value.length > 0

    if (this.hasUpperSecondarySchoolSubjectsNew) {
      const ids = value.map((subject: AlignmentObjectExtended) => subject.key).join(',')

      this.koodistoService.updateUpperSecondarySchoolModulesNew(ids)
    }
  }

  /**
   * Runs on upper secondary school modules change. Sets hasUpperSecondarySchoolModulesNew boolean value.
   * Updates upper secondary school objectives and contents based on selected modules.
   * @param value
   */
  upperSecondarySchoolModulesNewChange(value: AlignmentObjectExtended[]): void {
    this.hasUpperSecondarySchoolModulesNew = value.length > 0

    if (this.hasUpperSecondarySchoolModulesNew) {
      const ids = value.map((subject: AlignmentObjectExtended) => subject.key).join(',')

      this.koodistoService.updateUpperSecondarySchoolObjectivesNew(ids)
      this.koodistoService.updateUpperSecondarySchoolContentsNew(ids)
    }
  }

  /**
   * Runs on vocational education degree change. Sets hasVocationalDegrees boolean value. Updates
   * vocational education units based on selected degrees.
   */
  vocationalDegreesChange(): void {
    const basicDegrees = this.vocationalDegreesCtrl.value
    const furtherVocationalQualifications = this.furtherVocationalQualificationsCtrl.value
    const specialistVocationalQualifications = this.specialistVocationalQualificationsCtrl.value
    const degrees = basicDegrees.concat(
      furtherVocationalQualifications,
      specialistVocationalQualifications
    )

    this.hasVocationalDegrees = degrees.length > 0

    if (this.hasVocationalDegrees) {
      const ids = degrees.map((degree: AlignmentObjectExtended) => degree.key).join(',')

      this.koodistoService.updateVocationalUnits(ids)
    }
  }

  /**
   * Runs on vocational education unit change. Sets hasVocationalUnits boolean value. Updates
   * vocational education requirements based on selected units.
   * @param value
   */
  vocationalUnitsChange(value: AlignmentObjectExtended[]): void {
    this.hasVocationalUnits = value.length > 0

    if (this.hasVocationalUnits) {
      const ids = value.map((degree: AlignmentObjectExtended) => degree.key).join(',')

      this.koodistoService.updateVocationalRequirements(ids)
    }
  }

  /**
   * Runs on submit. If form is valid and dirty, changed material is saved on sessionStorage.
   * If form is valid, redirects user to the next tab.
   */
  onSubmit(): void {
    this.submitted = true

    if (this.form.valid) {
      if (this.form.dirty) {
        this.saveData()
      }
      void this.router.navigate(['/muokkaa-oppimateriaalia', this.materialId, this.tabId + 1])
    }
  }

  saveData(): void {
    const changedMaterial: EducationalMaterialForm =
      this.materialService.getEducationalMaterialEditForm() ?? this.material
    changedMaterial.educationalLevels = this.educationalLevelsCtrl.value

    // early childhood education
    changedMaterial.earlyChildhoodEducationSubjects = this.form.get(
      'earlyChildhoodEducationSubjects'
    ).value
    changedMaterial.suitsAllEarlyChildhoodSubjects = this.form.get(
      'suitsAllEarlyChildhoodSubjects'
    ).value
    changedMaterial.earlyChildhoodEducationObjectives = this.form.get(
      'earlyChildhoodEducationObjectives'
    ).value
    changedMaterial.earlyChildhoodEducationFramework = this.form.get(
      'earlyChildhoodEducationFramework'
    ).value

    // pre-primary education
    changedMaterial.prePrimaryEducationSubjects = this.form.get('prePrimaryEducationSubjects').value
    changedMaterial.suitsAllPrePrimarySubjects = this.form.get('suitsAllPrePrimarySubjects').value
    changedMaterial.prePrimaryEducationObjectives = this.form.get(
      'prePrimaryEducationObjectives'
    ).value
    changedMaterial.prePrimaryEducationFramework = this.form.get(
      'prePrimaryEducationFramework'
    ).value

    // basic education
    changedMaterial.basicStudySubjects = this.basicStudySubjectsCtrl.value
    changedMaterial.suitsAllBasicStudySubjects = this.form.get('suitsAllBasicStudySubjects').value
    changedMaterial.basicStudyObjectives = this.form.get('basicStudyObjectives').value
    changedMaterial.basicStudyContents = this.form.get('basicStudyContents').value
    changedMaterial.basicStudyFramework = this.form.get('basicStudyFramework').value

    // preparatory education
    changedMaterial.preparatoryEducationSubjects = this.form.get(
      'preparatoryEducationSubjects'
    ).value
    changedMaterial.preparatoryEducationObjectives = this.form.get(
      'preparatoryEducationObjectives'
    ).value

    // upper secondary school
    changedMaterial.upperSecondarySchoolSubjectsOld = this.upperSecondarySchoolSubjectsOldCtrl.value
    changedMaterial.upperSecondarySchoolCoursesOld = this.upperSecondarySchoolCoursesOldCtrl.value
    changedMaterial.suitsAllUpperSecondarySubjects = this.form.get(
      'suitsAllUpperSecondarySubjects'
    ).value
    changedMaterial.upperSecondarySchoolObjectives = this.form.get(
      'upperSecondarySchoolObjectives'
    ).value
    changedMaterial.upperSecondarySchoolFramework = this.form.get(
      'upperSecondarySchoolFramework'
    ).value
    changedMaterial.upperSecondarySchoolSubjectsNew = this.upperSecondarySchoolSubjectsNewCtrl.value
    changedMaterial.suitsAllUpperSecondarySubjectsNew = this.form.get(
      'suitsAllUpperSecondarySubjectsNew'
    ).value
    changedMaterial.upperSecondarySchoolModulesNew = this.upperSecondarySchoolModulesNewCtrl.value
    changedMaterial.upperSecondarySchoolObjectivesNew = this.form.get(
      'upperSecondarySchoolObjectivesNew'
    ).value
    changedMaterial.upperSecondarySchoolContentsNew = this.form.get(
      'upperSecondarySchoolContentsNew'
    ).value
    changedMaterial.newUpperSecondarySchoolFramework = this.form.get(
      'newUpperSecondarySchoolFramework'
    ).value

    // vocational education
    changedMaterial.vocationalDegrees = this.vocationalDegreesCtrl.value
    changedMaterial.suitsAllVocationalDegrees = this.form.get('suitsAllVocationalDegrees').value
    changedMaterial.vocationalUnits = this.vocationalUnitsCtrl.value
    changedMaterial.vocationalCommonUnits = this.vocationalCommonUnitsCtrl.value
    changedMaterial.vocationalRequirements = this.vocationalRequirementsCtrl.value
    changedMaterial.vocationalEducationFramework = this.form.get(
      'vocationalEducationFramework'
    ).value
    changedMaterial.furtherVocationalQualifications = this.furtherVocationalQualificationsCtrl.value
    changedMaterial.specialistVocationalQualifications =
      this.specialistVocationalQualificationsCtrl.value

    // self-motivated competence development
    changedMaterial.selfMotivatedEducationSubjects = this.form.get(
      'selfMotivatedEducationSubjects'
    ).value
    changedMaterial.suitsAllSelfMotivatedSubjects = this.form.get(
      'suitsAllSelfMotivatedSubjects'
    ).value
    changedMaterial.selfMotivatedEducationObjectives = this.form.get(
      'selfMotivatedEducationObjectives'
    ).value

    // higher education
    changedMaterial.branchesOfScience = this.form.get('branchesOfScience').value
    changedMaterial.suitsAllBranches = this.form.get('suitsAllBranches').value
    changedMaterial.scienceBranchObjectives = this.form.get('scienceBranchObjectives').value
    changedMaterial.higherEducationFramework = this.form.get('higherEducationFramework').value

    this.materialService.setEducationalMaterialEditForm(changedMaterial)
  }

  /**
   * Emits EventEmitter indicating user wants to abort.
   */
  abort(): void {
    this.abortEdit.emit()
  }

  /**
   * Redirects user to previous tab.
   */
  previous(): void {
    void this.router.navigate(['/muokkaa-oppimateriaalia', this.materialId, this.tabId - 1])
  }
}
