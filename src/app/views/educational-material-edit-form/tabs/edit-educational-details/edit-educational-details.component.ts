import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EducationalMaterialForm } from '@models/educational-material-form';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { Subscription } from 'rxjs';
import { EducationalLevel } from '@models/koodisto-proxy/educational-level';
import { AlignmentObjectExtended } from '@models/alignment-object-extended';
import { educationalLevelKeys } from '../../../../constants/educational-level-keys';

@Component({
  selector: 'app-tabs-edit-educational-details',
  templateUrl: './edit-educational-details.component.html',
  styleUrls: ['./edit-educational-details.component.scss']
})
export class EditEducationalDetailsComponent implements OnInit, OnDestroy {
  @Input() material: EducationalMaterialForm;
  @Input() materialId: number;
  @Input() tabId: number;
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
  upperSecondarySchoolSubjectSubscription: Subscription;
  upperSecondarySchoolSubjects: AlignmentObjectExtended[];
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
  hasUpperSecondarySchoolSubjectsNew = false;
  hasUpperSecondarySchoolModulesNew = false;
  hasVocationalEducation = false;
  hasVocationalDegrees = false;
  hasSelfMotivatedEducation = false;
  hasHigherEducation = false;
  @Output() abortEdit = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private koodistoSvc: KoodistoProxyService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      educationalLevels: this.fb.control(null, [ Validators.required ]),
      earlyChildhoodEducationSubjects: this.fb.control(null),
      suitsAllEarlyChildhoodSubjects: this.fb.control(false),
      earlyChildhoodEducationObjectives: this.fb.control(null),
      earlyChildhoodEducationFramework: this.fb.control(null),
      prePrimaryEducationSubjects: this.fb.control(null),
      suitsAllPrePrimarySubjects: this.fb.control(false),
      prePrimaryEducationObjectives: this.fb.control(null),
      prePrimaryEducationFramework: this.fb.control(null),
      basicStudySubjects: this.fb.control(null),
      suitsAllBasicStudySubjects: this.fb.control(false),
      basicStudyObjectives: this.fb.control(null),
      basicStudyContents: this.fb.control(null),
      basicStudyFramework: this.fb.control(null),
      currentUpperSecondarySchoolSelected: this.fb.control(false),
      newUpperSecondarySchoolSelected: this.fb.control(false),
      upperSecondarySchoolSubjects: this.fb.control(null),
      suitsAllUpperSecondarySubjects: this.fb.control(false),
      upperSecondarySchoolObjectives: this.fb.control(null),
      upperSecondarySchoolFramework: this.fb.control(null),
      upperSecondarySchoolSubjectsNew: this.fb.control(null),
      upperSecondarySchoolModulesNew: this.fb.control(null),
      upperSecondarySchoolObjectivesNew: this.fb.control(null),
      upperSecondarySchoolContentsNew: this.fb.control(null),
      suitsAllUpperSecondarySubjectsNew: this.fb.control(false),
      vocationalDegrees: this.fb.control(null),
      suitsAllVocationalDegrees: this.fb.control(false),
      vocationalUnits: this.fb.control(null),
      vocationalEducationObjectives: this.fb.control(null),
      vocationalEducationFramework: this.fb.control(null),
      selfMotivatedEducationSubjects: this.fb.control(null),
      suitsAllSelfMotivatedSubjects: this.fb.control(false),
      selfMotivatedEducationObjectives: this.fb.control(null),
      branchesOfScience: this.fb.control(null),
      suitsAllBranches: this.fb.control(false),
      scienceBranchObjectives: this.fb.control(null),
      higherEducationFramework: this.fb.control(null),
    });

    this.translate.onLangChange.subscribe(() => {
      this.koodistoSvc.updateEducationalLevels();
      this.koodistoSvc.updateBasicStudySubjects();
      this.koodistoSvc.updateUpperSecondarySchoolSubjects();
      this.koodistoSvc.updateUpperSecondarySchoolSubjectsNew();
      this.koodistoSvc.updateVocationalDegrees();
      this.koodistoSvc.updateScienceBranches();
    });

    if (sessionStorage.getItem(environment.editMaterial) !== null) {
      this.form.patchValue(JSON.parse(sessionStorage.getItem(environment.editMaterial)));
    } else {
      this.form.patchValue(this.material);
    }

    if (this.educationalLevelsCtrl.value && this.educationalLevelsCtrl.value.length > 0) {
      this.educationalLevelsChange(this.educationalLevelsCtrl.value);
    }

    // educational levels
    this.educationalLevelSubscription = this.koodistoSvc.educationalLevels$
      .subscribe((levels: EducationalLevel[]) => {
        this.educationalLevels = levels;
      });
    this.koodistoSvc.updateEducationalLevels();

    // basic study subjects
    this.basicStudySubjectSubscription = this.koodistoSvc.basicStudySubjects$
      .subscribe((subjects: AlignmentObjectExtended[]) => {
        this.basicStudySubjects = subjects;
      });
    this.koodistoSvc.updateBasicStudySubjects();

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

    // upper secondary school subjects
    this.upperSecondarySchoolSubjectSubscription = this.koodistoSvc.upperSecondarySchoolSubjects$
      .subscribe((subjects: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolSubjects = subjects;
      });
    this.koodistoSvc.updateUpperSecondarySchoolSubjects();

    // upper secondary school subjects (new)
    this.upperSecondarySchoolSubjectNewSubscription = this.koodistoSvc.upperSecondarySchoolSubjectsNew$
      .subscribe((subjects: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolSubjectsNew = subjects;
      });
    this.koodistoSvc.updateUpperSecondarySchoolSubjectsNew();

    // upper secondary school modules (new)
    this.upperSecondarySchoolModuleNewSubscription = this.koodistoSvc.upperSecondarySchoolModulesNew$
      .subscribe((modules: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolModulesNew = modules;
      });

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
    this.educationalLevelSubscription.unsubscribe();
    this.basicStudySubjectSubscription.unsubscribe();
    this.basicStudyObjectiveSubscription.unsubscribe();
    this.basicStudyContentSubscription.unsubscribe();
    this.upperSecondarySchoolSubjectSubscription.unsubscribe();
    this.upperSecondarySchoolSubjectNewSubscription.unsubscribe();
    this.upperSecondarySchoolModuleNewSubscription.unsubscribe();
    this.upperSecondarySchoolObjectiveNewSubscription.unsubscribe();
    this.upperSecondarySchoolContentNewSubscription.unsubscribe();
    this.vocationalDegreeSubscription.unsubscribe();
    this.vocationalUnitSubscription.unsubscribe();
    this.scienceBranchSubscription.unsubscribe();
  }

  get educationalLevelsCtrl(): FormControl {
    return this.form.get('educationalLevels') as FormControl;
  }

  /**
   * Runs on educational levels change. Sets hasX-type educational level boolean values.
   * @param value
   */
  educationalLevelsChange(value): void {
    this.hasEarlyChildhoodEducation = value.filter((e: any) => educationalLevelKeys.earlyChildhood.includes(e.key)).length > 0;

    this.hasPrePrimaryEducation = value.filter((e: any) => educationalLevelKeys.prePrimary.includes(e.key)).length > 0;

    this.hasBasicStudies = value.filter((e: any) => educationalLevelKeys.basicStudy.includes(e.key)).length > 0;

    if (this.hasBasicStudies === false) {
      this.hasBasicStudySubjects = false;
    }

    this.hasUpperSecondarySchool = value.filter((e: any) => educationalLevelKeys.upperSecondary.includes(e.key)).length > 0;

    this.hasVocationalEducation = value.filter((e: any) => educationalLevelKeys.vocational.includes(e.key)).length > 0;

    this.hasSelfMotivatedEducation = value.filter((e: any) => educationalLevelKeys.selfMotivated.includes(e.key)).length > 0;

    this.hasHigherEducation = value.filter((e: any) => educationalLevelKeys.higherEducation.includes(e.key)).length > 0;
  }

  /**
   * Runs on submit. If form is valid and dirty, changed material is saved on sessionStorage.
   * If form is valid, redirects user to the next tab.
   */
  onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      if (this.form.dirty) {
        const changedMaterial: EducationalMaterialForm = sessionStorage.getItem(environment.editMaterial) !== null
          ? JSON.parse(sessionStorage.getItem(environment.editMaterial))
          : this.material;

        changedMaterial.educationalLevels = this.form.get('educationalLevels').value;

        sessionStorage.setItem(environment.editMaterial, JSON.stringify(changedMaterial));
      }

      this.router.navigate(['/muokkaa-oppimateriaalia', this.materialId, this.tabId + 1]);
    }
  }

  /**
   * Emits EventEmitter indicating user wants to abort.
   */
  abort(): void {
    this.abortEdit.emit();
  }

  /**
   * Redirects user to previous tab.
   */
  previous(): void {
    this.router.navigate(['/muokkaa-oppimateriaalia', this.materialId, this.tabId - 1]);
  }
}
