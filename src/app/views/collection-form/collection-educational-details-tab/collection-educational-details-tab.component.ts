import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CollectionForm } from '@models/collections/collection-form';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs';
import { EducationalLevel } from '@models/koodisto-proxy/educational-level';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import {
  addEarlyChildhoodEducationSubject,
  addEarlyChildhoodEducationObjective,
  addPrePrimaryEducationSubject,
  addPrePrimaryEducationObjective,
  addUpperSecondarySchoolObjective,
  addVocationalEducationObjective,
  addSelfMotivatedEducationSubject,
  addSelfMotivatedEducationObjective,
  addScienceBranchObjectives,
  textInputValidator,
} from '../../../shared/shared.module';
import { educationalLevelKeys } from '../../../constants/educational-level-keys';
import { AlignmentObjectExtended } from '@models/alignment-object-extended';
import { validatorParams } from '../../../constants/validator-params';

@Component({
  selector: 'app-collection-educational-details-tab',
  templateUrl: './collection-educational-details-tab.component.html',
  styleUrls: ['./collection-educational-details-tab.component.scss']
})
export class CollectionEducationalDetailsTabComponent implements OnInit, OnDestroy {
  @Input() collection: CollectionForm;
  @Input() collectionId: string;
  @Input() tabId: number;
  @Output() abort = new EventEmitter();
  form: FormGroup;
  submitted = false;
  educationalLevelSubscription: Subscription;
  educationalLevels: EducationalLevel[];
  basicStudySubjectSubscription: Subscription;
  basicStudySubjects: AlignmentObjectExtended[];
  basicStudyObjectiveSubscription: Subscription;
  basicStudyObjectives: AlignmentObjectExtended[];
  basicStudyContentSubscription: Subscription;
  basicStudyContents: AlignmentObjectExtended[];
  upperSecondarySchoolSubjectOldSubscription: Subscription;
  upperSecondarySchoolSubjectsOld: AlignmentObjectExtended[];
  upperSecondarySchoolCourseOldSubscription: Subscription;
  upperSecondarySchoolCoursesOld: AlignmentObjectExtended[];
  upperSecondarySchoolSubjectNewSubscription: Subscription;
  upperSecondarySchoolSubjectsNew: AlignmentObjectExtended[];
  upperSecondarySchoolModuleNewSubscription: Subscription;
  upperSecondarySchoolModulesNew: AlignmentObjectExtended[];
  upperSecondarySchoolObjectiveNewSubscription: Subscription;
  upperSecondarySchoolObjectivesNew: AlignmentObjectExtended[];
  upperSecondarySchoolContentNewSubscription: Subscription;
  upperSecondarySchoolContentsNew: AlignmentObjectExtended[];
  vocationalDegreeSubscription: Subscription;
  vocationalDegrees: AlignmentObjectExtended[];
  vocationalUnitSubscription: Subscription;
  vocationalUnits: AlignmentObjectExtended[];
  scienceBranchSubscription: Subscription;
  scienceBranches: AlignmentObjectExtended[];
  hasEarlyChildhoodEducation = false;
  hasPrePrimaryEducation = false;
  hasBasicStudies = false;
  hasBasicStudySubjects = false;
  hasUpperSecondarySchool = false;
  hasUpperSecondarySchoolSubjectsOld = false;
  hasUpperSecondarySchoolSubjectsNew = false;
  hasUpperSecondarySchoolModulesNew = false;
  hasVocationalEducation = false;
  hasVocationalDegrees = false;
  hasSelfMotivatedEducation = false;
  hasHigherEducation = false;
  addEarlyChildhoodEducationSubject = addEarlyChildhoodEducationSubject;
  addEarlyChildhoodEducationObjective = addEarlyChildhoodEducationObjective;
  addPrePrimaryEducationSubject = addPrePrimaryEducationSubject;
  addPrePrimaryEducationObjective = addPrePrimaryEducationObjective;
  addUpperSecondarySchoolObjective = addUpperSecondarySchoolObjective;
  addVocationalEducationObjective = addVocationalEducationObjective;
  addSelfMotivatedEducationSubject = addSelfMotivatedEducationSubject;
  addSelfMotivatedEducationObjective = addSelfMotivatedEducationObjective;
  addScienceBranchObjectives = addScienceBranchObjectives;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private router: Router,
    private titleSvc: Title,
    private koodistoSvc: KoodistoProxyService,
  ) { }

  ngOnInit(): void {
    this.setTitle();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setTitle();

      this.koodistoSvc.updateEducationalLevels();
      this.koodistoSvc.updateBasicStudySubjects();
      this.koodistoSvc.updateUpperSecondarySchoolSubjectsOld();
      this.koodistoSvc.updateUpperSecondarySchoolSubjectsNew();
      this.koodistoSvc.updateVocationalDegrees();
      this.koodistoSvc.updateScienceBranches();
    });

    this.form = this.fb.group({
      educationalLevels: this.fb.control(null),
      earlyChildhoodEducationSubjects: this.fb.control(null),
      earlyChildhoodEducationObjectives: this.fb.control(null),
      earlyChildhoodEducationFramework: this.fb.control(null, [
        Validators.maxLength(validatorParams.educationalFramework.maxLength),
        textInputValidator(),
      ]),
      prePrimaryEducationSubjects: this.fb.control(null),
      prePrimaryEducationObjectives: this.fb.control(null),
      prePrimaryEducationFramework: this.fb.control(null, [
        Validators.maxLength(validatorParams.educationalFramework.maxLength),
        textInputValidator(),
      ]),
      basicStudySubjects: this.fb.control(null),
      basicStudyObjectives: this.fb.control(null),
      basicStudyContents: this.fb.control(null),
      basicStudyFramework: this.fb.control(null, [
        Validators.maxLength(validatorParams.educationalFramework.maxLength),
        textInputValidator(),
      ]),
      currentUpperSecondarySchoolSelected: this.fb.control(false),
      newUpperSecondarySchoolSelected: this.fb.control(false),
      upperSecondarySchoolSubjectsOld: this.fb.control(null),
      upperSecondarySchoolCoursesOld: this.fb.control(null),
      upperSecondarySchoolObjectives: this.fb.control(null),
      upperSecondarySchoolFramework: this.fb.control(null, [
        Validators.maxLength(validatorParams.educationalFramework.maxLength),
        textInputValidator(),
      ]),
      upperSecondarySchoolSubjectsNew: this.fb.control(null),
      upperSecondarySchoolModulesNew: this.fb.control(null),
      upperSecondarySchoolObjectivesNew: this.fb.control(null),
      upperSecondarySchoolContentsNew: this.fb.control(null),
      vocationalDegrees: this.fb.control(null),
      vocationalUnits: this.fb.control(null),
      vocationalEducationObjectives: this.fb.control(null),
      vocationalEducationFramework: this.fb.control(null, [
        Validators.maxLength(validatorParams.educationalFramework.maxLength),
        textInputValidator(),
      ]),
      selfMotivatedEducationSubjects: this.fb.control(null),
      selfMotivatedEducationObjectives: this.fb.control(null),
      scienceBranches: this.fb.control(null),
      scienceBranchObjectives: this.fb.control(null),
      higherEducationFramework: this.fb.control(null, [
        Validators.maxLength(validatorParams.educationalFramework.maxLength),
        textInputValidator(),
      ]),
    });

    if (sessionStorage.getItem(environment.collection) === null) {
      this.form.patchValue(this.collection);
    } else {
      this.form.patchValue(JSON.parse(sessionStorage.getItem(environment.collection)));
    }

    // educational levels
    this.educationalLevelSubscription = this.koodistoSvc.educationalLevels$
      .subscribe((levels: EducationalLevel[]) => {
        this.educationalLevels = levels;
      });
    this.koodistoSvc.updateEducationalLevels();

    if (this.educationalLevelsCtrl.value.length > 0) {
      this.educationalLevelsChange(this.educationalLevelsCtrl.value);
    }

    // basic study subjects
    this.basicStudySubjectSubscription = this.koodistoSvc.basicStudySubjects$
      .subscribe((subjects: AlignmentObjectExtended[]) => {
        this.basicStudySubjects = subjects;
      });
    this.koodistoSvc.updateBasicStudySubjects();

    if (this.basicStudySubjectsCtrl.value.length > 0) {
      this.basicStudySubjectsChange(this.basicStudySubjectsCtrl.value);
    }

    // basic study objectives
    this.basicStudyObjectiveSubscription = this.koodistoSvc.basicStudyObjectives$
      .subscribe((objectives: AlignmentObjectExtended[]) => {
        this.basicStudyObjectives = objectives;
      });

    // basic study contents
    this.basicStudyContentSubscription = this.koodistoSvc.basicStudyContents$
      .subscribe((contents: AlignmentObjectExtended[]) => {
        this.basicStudyContents = contents;
      });

    // upper secondary school subjects (old)
    this.upperSecondarySchoolSubjectOldSubscription = this.koodistoSvc.upperSecondarySchoolSubjectsOld$
      .subscribe((subjects: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolSubjectsOld = subjects;
      });
    this.koodistoSvc.updateUpperSecondarySchoolSubjectsOld();

    if (this.upperSecondarySchoolSubjectsOldCtrl.value?.length > 0 || this.upperSecondarySchoolCoursesOldCtrl.value?.length > 0) {
      this.currentUpperSecondarySchoolSelected.setValue(true);
    }

    if (this.upperSecondarySchoolSubjectsOldCtrl.value?.length > 0) {
      this.upperSecondarySchoolSubjectsOldChange(this.upperSecondarySchoolSubjectsOldCtrl.value);
    }

    this.upperSecondarySchoolCourseOldSubscription = this.koodistoSvc.upperSecondarySchoolCoursesOld$
      .subscribe((courses: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolCoursesOld = courses;
      });

    // upper secondary school subjects (new)
    this.upperSecondarySchoolSubjectNewSubscription = this.koodistoSvc.upperSecondarySchoolSubjectsNew$
      .subscribe((subjects: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolSubjectsNew = subjects;
      });
    this.koodistoSvc.updateUpperSecondarySchoolSubjectsNew();

    if (this.upperSecondarySchoolSubjectsNewCtrl.value.length > 0) {
      this.newUpperSecondarySchoolSelected.setValue(true);
      this.upperSecondarySchoolSubjectsNewChange(this.upperSecondarySchoolSubjectsNewCtrl.value);
    }

    // upper secondary school modules (new)
    this.upperSecondarySchoolModuleNewSubscription = this.koodistoSvc.upperSecondarySchoolModulesNew$
      .subscribe((modules: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolModulesNew = modules;
      });

    if (this.upperSecondarySchoolModulesNewCtrl.value.length > 0) {
      this.upperSecondarySchoolModulesNewChange(this.upperSecondarySchoolModulesNewCtrl.value);
    }

    // upper secondary school objectives (new)
    this.upperSecondarySchoolObjectiveNewSubscription = this.koodistoSvc.upperSecondarySchoolObjectivesNew$
      .subscribe((objectives: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolObjectivesNew = objectives;
      });

    // upper secondary school contents (new)
    this.upperSecondarySchoolContentNewSubscription = this.koodistoSvc.upperSecondarySchoolContentsNew$
      .subscribe((contents: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolContentsNew = contents;
      });

    // vocational degrees
    this.vocationalDegreeSubscription = this.koodistoSvc.vocationalDegrees$
      .subscribe((degrees: AlignmentObjectExtended[]) => {
        this.vocationalDegrees = degrees;
      });
    this.koodistoSvc.updateVocationalDegrees();

    if (this.vocationalDegreesCtrl.value.length > 0) {
      this.vocationalDegreesChange(this.vocationalDegreesCtrl.value);
    }

    // vocational units
    this.vocationalUnitSubscription = this.koodistoSvc.vocationalUnits$
      .subscribe((units: AlignmentObjectExtended[]) => {
        this.vocationalUnits = units;
      });

    // science branches
    this.scienceBranchSubscription = this.koodistoSvc.scienceBranches$
      .subscribe((branches: AlignmentObjectExtended[]) => {
        this.scienceBranches = branches;
      });
    this.koodistoSvc.updateScienceBranches();
  }

  ngOnDestroy(): void {
    if (this.submitted === false && this.form.dirty && this.form.valid) {
      this.saveCollection();
    }

    this.educationalLevelSubscription.unsubscribe();
    this.basicStudySubjectSubscription.unsubscribe();
    this.basicStudyObjectiveSubscription.unsubscribe();
    this.basicStudyContentSubscription.unsubscribe();
    this.upperSecondarySchoolSubjectOldSubscription.unsubscribe();
    this.upperSecondarySchoolCourseOldSubscription.unsubscribe();
    this.upperSecondarySchoolSubjectNewSubscription.unsubscribe();
    this.upperSecondarySchoolModuleNewSubscription.unsubscribe();
    this.upperSecondarySchoolObjectiveNewSubscription.unsubscribe();
    this.upperSecondarySchoolContentNewSubscription.unsubscribe();
    this.vocationalDegreeSubscription.unsubscribe();
    this.vocationalUnitSubscription.unsubscribe();
    this.scienceBranchSubscription.unsubscribe();
  }

  /**
   * Updates page title.
   */
  setTitle(): void {
    this.translate.get('titles.collection').subscribe((translations: any) => {
      this.titleSvc.setTitle(`${translations.main}: ${translations.educational} ${environment.title}`);
    });
  }

  /** @getters */
  get educationalLevelsCtrl(): FormControl {
    return this.form.get('educationalLevels') as FormControl;
  }

  get earlyChildhoodEducationFrameworkCtrl(): FormControl {
    return this.form.get('earlyChildhoodEducationFramework') as FormControl;
  }

  get prePrimaryEducationFrameworkCtrl(): FormControl {
    return this.form.get('prePrimaryEducationFramework') as FormControl;
  }

  get basicStudySubjectsCtrl(): FormControl {
    return this.form.get('basicStudySubjects') as FormControl;
  }

  get basicStudyFrameworkCtrl(): FormControl {
    return this.form.get('basicStudyFramework') as FormControl;
  }

  get currentUpperSecondarySchoolSelected(): FormControl {
    return this.form.get('currentUpperSecondarySchoolSelected') as FormControl;
  }

  get newUpperSecondarySchoolSelected(): FormControl {
    return this.form.get('newUpperSecondarySchoolSelected') as FormControl;
  }

  get upperSecondarySchoolSubjectsOldCtrl(): FormControl {
    return this.form.get('upperSecondarySchoolSubjectsOld') as FormControl;
  }

  get upperSecondarySchoolCoursesOldCtrl(): FormControl {
    return this.form.get('upperSecondarySchoolCoursesOld') as FormControl;
  }

  get upperSecondarySchoolFrameworkCtrl(): FormControl {
    return this.form.get('upperSecondarySchoolFramework') as FormControl;
  }

  get upperSecondarySchoolSubjectsNewCtrl(): FormControl {
    return this.form.get('upperSecondarySchoolSubjectsNew') as FormControl;
  }

  get upperSecondarySchoolModulesNewCtrl(): FormControl {
    return this.form.get('upperSecondarySchoolModulesNew') as FormControl;
  }

  get vocationalDegreesCtrl(): FormControl {
    return this.form.get('vocationalDegrees') as FormControl;
  }

  get vocationalEducationFrameworkCtrl(): FormControl {
    return this.form.get('vocationalEducationFramework') as FormControl;
  }

  get higherEducationFrameworkCtrl(): FormControl {
    return this.form.get('higherEducationFramework') as FormControl;
  }

  /**
   * Runs on educational levels change. Sets hasX-type educational level boolean values.
   * @param value {EducationalLevel[]}
   */
  educationalLevelsChange(value: EducationalLevel[]): void {
    this.hasEarlyChildhoodEducation = value
      .filter((level: EducationalLevel) => educationalLevelKeys.earlyChildhood.includes(level.key))
      .length > 0;

    this.hasPrePrimaryEducation = value
      .filter((level: EducationalLevel) => educationalLevelKeys.prePrimary.includes(level.key))
      .length > 0;

    this.hasBasicStudies = value
      .filter((level: EducationalLevel) => educationalLevelKeys.basicStudy.includes(level.key))
      .length > 0;

    if (this.hasBasicStudies === false) {
      this.hasBasicStudySubjects = false;
    }

    this.hasUpperSecondarySchool = value
      .filter((level: EducationalLevel) => educationalLevelKeys.upperSecondary.includes(level.key))
      .length > 0;

    this.hasVocationalEducation = value
      .filter((level: EducationalLevel) => educationalLevelKeys.vocational.includes(level.key))
      .length > 0;

    this.hasSelfMotivatedEducation = value
      .filter((level: EducationalLevel) => educationalLevelKeys.selfMotivated.includes(level.key))
      .length > 0;

    this.hasHigherEducation = value
      .filter((level: EducationalLevel) => educationalLevelKeys.higherEducation.includes(level.key))
      .length > 0;
  }

  /**
   * Runs on basic education subjects change. Sets hasBasicStudySubjects boolean value.
   * Updates basic education objectives and contents based on selected subjects.
   * @param value {AlignmentObjectExtended[]}
   */
  basicStudySubjectsChange(value: AlignmentObjectExtended[]): void {
    this.hasBasicStudySubjects = value.length > 0;

    if (this.hasBasicStudySubjects) {
      const ids = value.map((subject: AlignmentObjectExtended) => subject.key).join(',');

      this.koodistoSvc.updateBasicStudyObjectives(ids);
      this.koodistoSvc.updateBasicStudyContents(ids);
    }
  }

  /**
   * Runs on upper secondary school subject (old) change. Sets hasUpperSecondarySchoolSubjectsOld boolean
   * value. Updates upper secondary school courses based on selected subjects.
   * @param value
   */
  upperSecondarySchoolSubjectsOldChange(value): void {
    this.hasUpperSecondarySchoolSubjectsOld = value.length > 0;

    if (this.hasUpperSecondarySchoolSubjectsOld) {
      const ids = value.map((subject: AlignmentObjectExtended) => subject.key).join(',');

      this.koodistoSvc.updateUpperSecondarySchoolCoursesOld(ids);
    }
  }

  /**
   * Runs on upper secondary school subject (new) change. Sets hasUpperSecondarySchoolSubjectsNew boolean
   * value. Updates upper secondary school modules based on selected subjects.
   * @param value {AlignmentObjectExtended[]}
   */
  upperSecondarySchoolSubjectsNewChange(value: AlignmentObjectExtended[]): void {
    this.hasUpperSecondarySchoolSubjectsNew = value.length > 0;

    if (this.hasUpperSecondarySchoolSubjectsNew) {
      const ids = value.map((subject: AlignmentObjectExtended) => subject.key).join(',');

      this.koodistoSvc.updateUpperSecondarySchoolModulesNew(ids);
    }
  }

  /**
   * Runs on upper secondary school modules change. Sets hasUpperSecondarySchoolModulesNew boolean value.
   * Updates upper secondary school objectives and contents based on selected modules.
   * @param value {AlignmentObjectExtended[]}
   */
  upperSecondarySchoolModulesNewChange(value: AlignmentObjectExtended[]): void {
    this.hasUpperSecondarySchoolModulesNew = value.length > 0;

    if (this.hasUpperSecondarySchoolModulesNew) {
      const ids = value.map((subject: AlignmentObjectExtended) => subject.key).join(',');

      this.koodistoSvc.updateUpperSecondarySchoolObjectivesNew(ids);
      this.koodistoSvc.updateUpperSecondarySchoolContentsNew(ids);
    }
  }

  /**
   * Runs on vocational education degree change. Sets hasVocationalDegrees boolean value. Updates
   * vocational education units based on selected degrees.
   * @param value {AlignmentObjectExtended[]}
   */
  vocationalDegreesChange(value: AlignmentObjectExtended[]): void {
    this.hasVocationalDegrees = value.length > 0;

    if (this.hasVocationalDegrees) {
      const ids = value.map((degree: AlignmentObjectExtended) => degree.key).join(',');

      this.koodistoSvc.updateVocationalUnits(ids);
    }
  }

  /**
   * Runs on submit. Redirects user to the next tab if form is valid.
   */
  onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      if (this.form.dirty) {
        this.saveCollection();
      }

      this.router.navigate(['/kokoelma', this.collectionId, 'muokkaa', this.tabId + 1]);
    }
  }

  /**
   * Saves collection to session storage.
   */
  saveCollection(): void {
    if (!this.hasEarlyChildhoodEducation) {
      this.form.get('earlyChildhoodEducationSubjects').setValue([]);
      this.form.get('earlyChildhoodEducationObjectives').setValue([]);
      this.earlyChildhoodEducationFrameworkCtrl.setValue(null);
    }

    if (!this.hasPrePrimaryEducation) {
      this.form.get('prePrimaryEducationSubjects').setValue([]);
      this.form.get('prePrimaryEducationObjectives').setValue([]);
      this.prePrimaryEducationFrameworkCtrl.setValue(null);
    }

    if (!this.hasBasicStudies) {
      this.basicStudySubjectsCtrl.setValue([]);
      this.form.get('basicStudyObjectives').setValue([]);
      this.form.get('basicStudyContents').setValue([]);
      this.basicStudyFrameworkCtrl.setValue(null);
    }

    if (!this.hasBasicStudySubjects) {
      this.form.get('basicStudyObjectives').setValue([]);
      this.form.get('basicStudyContents').setValue([]);
      this.basicStudyFrameworkCtrl.setValue(null);
    }

    if (!this.hasUpperSecondarySchool) {
      this.currentUpperSecondarySchoolSelected.setValue(false);
      this.newUpperSecondarySchoolSelected.setValue(false);
      this.upperSecondarySchoolSubjectsOldCtrl.setValue([]);
      this.upperSecondarySchoolCoursesOldCtrl.setValue([]);
      this.form.get('upperSecondarySchoolObjectives').setValue([]);
      this.upperSecondarySchoolFrameworkCtrl.setValue(null);
      this.upperSecondarySchoolSubjectsNewCtrl.setValue([]);
      this.upperSecondarySchoolModulesNewCtrl.setValue([]);
      this.form.get('upperSecondarySchoolObjectivesNew').setValue([]);
      this.form.get('upperSecondarySchoolContentsNew').setValue([]);
    }

    if (!this.currentUpperSecondarySchoolSelected.value) {
      this.upperSecondarySchoolSubjectsOldCtrl.setValue([]);
      this.upperSecondarySchoolCoursesOldCtrl.setValue([]);
      this.form.get('upperSecondarySchoolObjectives').setValue([]);
      this.upperSecondarySchoolFrameworkCtrl.setValue(null);
    }

    if (!this.hasUpperSecondarySchoolSubjectsOld) {
      this.upperSecondarySchoolCoursesOldCtrl.setValue([]);
    }

    if (!this.newUpperSecondarySchoolSelected.value) {
      this.upperSecondarySchoolSubjectsNewCtrl.setValue([]);
      this.upperSecondarySchoolModulesNewCtrl.setValue([]);
      this.form.get('upperSecondarySchoolObjectivesNew').setValue([]);
      this.form.get('upperSecondarySchoolContentsNew').setValue([]);
    }

    if (!this.hasUpperSecondarySchoolSubjectsNew) {
      this.upperSecondarySchoolModulesNewCtrl.setValue([]);
      this.form.get('upperSecondarySchoolObjectivesNew').setValue([]);
      this.form.get('upperSecondarySchoolContentsNew').setValue([]);
    }

    if (!this.hasUpperSecondarySchoolModulesNew) {
      this.form.get('upperSecondarySchoolObjectivesNew').setValue([]);
      this.form.get('upperSecondarySchoolContentsNew').setValue([]);
    }

    if (!this.hasVocationalEducation) {
      this.vocationalDegreesCtrl.setValue([]);
      this.form.get('vocationalUnits').setValue([]);
      this.form.get('vocationalEducationObjectives').setValue([]);
      this.vocationalEducationFrameworkCtrl.setValue(null);
    }

    if (!this.hasVocationalDegrees) {
      this.form.get('vocationalUnits').setValue([]);
      this.form.get('vocationalEducationObjectives').setValue([]);
      this.vocationalEducationFrameworkCtrl.setValue(null);
    }

    if (!this.hasSelfMotivatedEducation) {
      this.form.get('selfMotivatedEducationSubjects').setValue([]);
      this.form.get('selfMotivatedEducationObjectives').setValue([]);
    }

    if (!this.hasHigherEducation) {
      this.form.get('scienceBranches').setValue([]);
      this.form.get('scienceBranchObjectives').setValue([]);
      this.higherEducationFrameworkCtrl.setValue(null);
    }

    const changedCollection: CollectionForm = Object.assign(
      {},
      sessionStorage.getItem(environment.collection) !== null
        ? JSON.parse(sessionStorage.getItem(environment.collection))
        : this.collection,
      this.form.value,
    );

    sessionStorage.setItem(environment.collection, JSON.stringify(changedCollection));
  }

  /**
   * Emits EventEmitter indicating user wants to abort.
   */
  emitAbort(): void {
    this.abort.emit();
  }

  /**
   * Redirects user to previous tab.
   */
  previous(): void {
    this.router.navigate(['/kokoelma', this.collectionId, 'muokkaa', this.tabId - 1]);
  }
}
