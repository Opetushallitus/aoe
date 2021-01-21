import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { environment } from '../../../../../environments/environment';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { AlignmentObjectExtended } from '@models/alignment-object-extended';
import { EducationalLevel } from '@models/koodisto-proxy/educational-level';
import { educationalLevelKeys } from '../../../../constants/educational-level-keys';
import { koodistoSources } from '../../../../constants/koodisto-sources';
import {
  addEarlyChildhoodEducationSubject,
  addEarlyChildhoodEducationObjective,
  addPrePrimaryEducationSubject,
  addPrePrimaryEducationObjective,
  addUpperSecondarySchoolObjective,
  addVocationalEducationObjective,
  addSelfMotivatedEducationSubject,
  addSelfMotivatedEducationObjective,
  addScienceBranchObjectives, textInputValidator,
} from '../../../../shared/shared.module';
import { Title } from '@angular/platform-browser';
import { validatorParams } from '../../../../constants/validator-params';

@Component({
  selector: 'app-tabs-educational-details',
  templateUrl: './educational-details.component.html',
})
export class EducationalDetailsComponent implements OnInit, OnDestroy {
  lang: string = this.translate.currentLang;
  savedData: any;

  form: FormGroup;
  submitted = false;
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
  hasVocationalUnits = false;
  hasSelfMotivatedEducation = false;
  hasHigherEducation = false;

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
  vocationalRequirementSubscription: Subscription;
  vocationalRequirements: AlignmentObjectExtended[];
  furtherVocationalQualificationSubscription: Subscription;
  furtherVocationalQualifications: AlignmentObjectExtended[];
  specialistVocationalQualificationSubscription: Subscription;
  specialistVocationalQualifications: AlignmentObjectExtended[];
  scienceBranchSubscription: Subscription;
  scienceBranches: AlignmentObjectExtended[];

  addEarlyChildhoodEducationSubject = addEarlyChildhoodEducationSubject;
  addEarlyChildhoodEducationObjective = addEarlyChildhoodEducationObjective;
  addPrePrimaryEducationSubject = addPrePrimaryEducationSubject;
  addPrePrimaryEducationObjective = addPrePrimaryEducationObjective;
  addUpperSecondarySchoolObjective = addUpperSecondarySchoolObjective;
  addVocationalEducationObjective = addVocationalEducationObjective;
  addSelfMotivatedEducationSubject = addSelfMotivatedEducationSubject;
  addSelfMotivatedEducationObjective = addSelfMotivatedEducationObjective;
  addScienceBranchObjectives = addScienceBranchObjectives;

  private alignmentObjects: AlignmentObjectExtended[] = [];

  constructor(
    private fb: FormBuilder,
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
    private router: Router,
    private titleSvc: Title,
  ) { }

  ngOnInit() {
    this.setTitle();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.setTitle();

      this.koodistoProxySvc.updateEducationalLevels();
      this.koodistoProxySvc.updateBasicStudySubjects();
      this.koodistoProxySvc.updateUpperSecondarySchoolSubjectsOld();
      this.koodistoProxySvc.updateUpperSecondarySchoolSubjectsNew();
      this.koodistoProxySvc.updateVocationalDegrees();
      this.koodistoProxySvc.updateFurtherVocationalQualifications();
      this.koodistoProxySvc.updateSpecialistVocationalQualifications();
      this.koodistoProxySvc.updateScienceBranches();
    });

    this.savedData = JSON.parse(sessionStorage.getItem(environment.newERLSKey));

    this.form = this.fb.group({
      educationalLevels: this.fb.control(null),
      earlyChildhoodEducationSubjects: this.fb.control(null),
      suitsAllEarlyChildhoodSubjects: this.fb.control(false),
      earlyChildhoodEducationObjectives: this.fb.control(null),
      earlyChildhoodEducationFramework: this.fb.control(null, [
        Validators.maxLength(validatorParams.educationalFramework.maxLength),
        textInputValidator(),
      ]),
      prePrimaryEducationSubjects: this.fb.control(null),
      suitsAllPrePrimarySubjects: this.fb.control(false),
      prePrimaryEducationObjectives: this.fb.control(null),
      prePrimaryEducationFramework: this.fb.control(null, [
        Validators.maxLength(validatorParams.educationalFramework.maxLength),
        textInputValidator(),
      ]),
      basicStudySubjects: this.fb.control(null),
      suitsAllBasicStudySubjects: this.fb.control(false),
      basicStudyObjectives: this.fb.control(null),
      basicStudyContents: this.fb.control(null),
      basicStudyFramework: this.fb.control(null, [
        Validators.maxLength(validatorParams.educationalFramework.maxLength),
        textInputValidator(),
      ]),
      currentUpperSecondarySchoolSelected: this.fb.control(false),
      newUpperSecondarySchoolSelected: this.fb.control(false),
      suitsAllUpperSecondarySubjects: this.fb.control(false),
      upperSecondarySchoolObjectives: this.fb.control(null),
      upperSecondarySchoolFramework: this.fb.control(null, [
        Validators.maxLength(validatorParams.educationalFramework.maxLength),
        textInputValidator(),
      ]),
      upperSecondarySchoolSubjectsOld: this.fb.control(null),
      upperSecondarySchoolCoursesOld: this.fb.control(null),
      upperSecondarySchoolSubjectsNew: this.fb.control(null),
      upperSecondarySchoolModulesNew: this.fb.control(null),
      upperSecondarySchoolObjectivesNew: this.fb.control(null),
      upperSecondarySchoolContentsNew: this.fb.control(null),
      suitsAllUpperSecondarySubjectsNew: this.fb.control(false),
      vocationalDegrees: this.fb.control(null),
      suitsAllVocationalDegrees: this.fb.control(false),
      vocationalUnits: this.fb.control(null),
      vocationalRequirements: this.fb.control(null),
      vocationalEducationFramework: this.fb.control(null, [
        Validators.maxLength(validatorParams.educationalFramework.maxLength),
        textInputValidator(),
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
        textInputValidator(),
      ]),
    });

    this.educationalLevelSubscription = this.koodistoProxySvc.educationalLevels$
      .subscribe((educationalLevels: EducationalLevel[]) => {
        this.educationalLevels = educationalLevels;
      });
    this.koodistoProxySvc.updateEducationalLevels();

    this.basicStudySubjectSubscription = this.koodistoProxySvc.basicStudySubjects$
      .subscribe((basicStudySubjects: AlignmentObjectExtended[]) => {
        this.basicStudySubjects = basicStudySubjects;
      });
    this.koodistoProxySvc.updateBasicStudySubjects();

    this.basicStudyObjectiveSubscription = this.koodistoProxySvc.basicStudyObjectives$
      .subscribe((basicStudyObjectives: AlignmentObjectExtended[]) => {
        this.basicStudyObjectives = basicStudyObjectives;
      });

    this.basicStudyContentSubscription = this.koodistoProxySvc.basicStudyContents$
      .subscribe((basicStudyContents: AlignmentObjectExtended[]) => {
        this.basicStudyContents = basicStudyContents;
      });

    this.upperSecondarySchoolSubjectOldSubscription = this.koodistoProxySvc.upperSecondarySchoolSubjectsOld$
      .subscribe((subjects: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolSubjectsOld = subjects;
      });
    this.koodistoProxySvc.updateUpperSecondarySchoolSubjectsOld();

    this.upperSecondarySchoolCourseOldSubscription = this.koodistoProxySvc.upperSecondarySchoolCoursesOld$
      .subscribe((courses: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolCoursesOld = courses;
      });

    this.upperSecondarySchoolSubjectNewSubscription = this.koodistoProxySvc.upperSecondarySchoolSubjectsNew$
      .subscribe((subjects: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolSubjectsNew = subjects;
      });
    this.koodistoProxySvc.updateUpperSecondarySchoolSubjectsNew();

    this.upperSecondarySchoolModuleNewSubscription = this.koodistoProxySvc.upperSecondarySchoolModulesNew$
      .subscribe((modules: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolModulesNew = modules;
      });

    this.upperSecondarySchoolObjectiveNewSubscription = this.koodistoProxySvc.upperSecondarySchoolObjectivesNew$
      .subscribe((objectives: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolObjectivesNew = objectives;
      });

    this.upperSecondarySchoolContentNewSubscription = this.koodistoProxySvc.upperSecondarySchoolContentsNew$
      .subscribe((contents: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolContentsNew = contents;
      });

    this.vocationalDegreeSubscription = this.koodistoProxySvc.vocationalDegrees$
      .subscribe((vocationalDegrees: AlignmentObjectExtended[]) => {
        this.vocationalDegrees = vocationalDegrees;
      });
    this.koodistoProxySvc.updateVocationalDegrees();

    this.vocationalUnitSubscription = this.koodistoProxySvc.vocationalUnits$
      .subscribe((vocationalUnits: AlignmentObjectExtended[]) => {
        this.vocationalUnits = vocationalUnits;
      });

    this.vocationalRequirementSubscription = this.koodistoProxySvc.vocationalRequirements$
      .subscribe((requirements: AlignmentObjectExtended[]) => {
        this.vocationalRequirements = requirements;
      });

    // further vocational qualifications
    this.furtherVocationalQualificationSubscription = this.koodistoProxySvc.furtherVocationalQualifications$
      .subscribe((qualifications: AlignmentObjectExtended[]) => {
        this.furtherVocationalQualifications = qualifications;
      });
    this.koodistoProxySvc.updateFurtherVocationalQualifications();

    // specialist vocational qualifications
    this.specialistVocationalQualificationSubscription = this.koodistoProxySvc.specialistVocationalQualifications$
      .subscribe((qualifications: AlignmentObjectExtended[]) => {
        this.specialistVocationalQualifications = qualifications;
      });
    this.koodistoProxySvc.updateSpecialistVocationalQualifications();

    this.scienceBranchSubscription = this.koodistoProxySvc.scienceBranches$
      .subscribe((scienceBranches: AlignmentObjectExtended[]) => {
        this.scienceBranches = scienceBranches;
      });
    this.koodistoProxySvc.updateScienceBranches();

    if (this.savedData) {
      if (this.savedData.educationalLevels) {
        this.educationalLevelsCtrl.setValue(this.savedData.educationalLevels);

        this.educationalLevelsChange(this.savedData.educationalLevels);
      }

      if (this.savedData.alignmentObjects) {
        // early childhood education
        const earlyChildhoodEducationSubjects = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.earlyChildhoodSubjects);
        this.earlyChildhoodEducationSubjects.setValue(earlyChildhoodEducationSubjects);

        const earlyChildhoodEducationObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.earlyChildhoodObjectives);
        this.earlyChildhoodEducationObjectives.setValue(earlyChildhoodEducationObjectives);

        if (earlyChildhoodEducationSubjects.length > 0 && 'educationalFramework' in earlyChildhoodEducationSubjects[0]) {
          // tslint:disable-next-line:max-line-length
          this.earlyChildhoodEducationFramework.setValue(earlyChildhoodEducationSubjects[0].educationalFramework);
        }

        // pre-primary education
        const prePrimaryEducationSubjects = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.prePrimarySubjects);
        this.prePrimaryEducationSubjects.setValue(prePrimaryEducationSubjects);

        const prePrimaryEducationObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.prePrimaryObjectives);
        this.prePrimaryEducationObjectives.setValue(prePrimaryEducationObjectives);

        if (prePrimaryEducationSubjects.length > 0 && 'educationalFramework' in prePrimaryEducationSubjects[0]) {
          // tslint:disable-next-line:max-line-length
          this.prePrimaryEducationFramework.setValue(prePrimaryEducationSubjects[0].educationalFramework);
        }

        // basic education
        const basicStudySubjects = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.basicStudySubjects);
        this.basicStudySubjectsCtrl.setValue(basicStudySubjects);
        this.basicStudySubjectsChange(basicStudySubjects);

        const basicStudyObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.basicStudyObjectives);
        this.basicStudyObjectivesCtrl.setValue(basicStudyObjectives);

        const basicStudyContents = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.basicStudyContents);
        this.basicStudyContentsCtrl.setValue(basicStudyContents);

        if (basicStudySubjects.length > 0 && 'educationalFramework' in basicStudySubjects[0]) {
          // tslint:disable-next-line:max-line-length
          this.basicStudyFramework.setValue(basicStudySubjects[0].educationalFramework);
        }

        // upper secondary school (old)
        const upperSecondarySchoolSubjectsOld = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondarySubjectsOld);
        this.upperSecondarySchoolSubjectsOldCtrl.setValue(upperSecondarySchoolSubjectsOld);
        this.upperSecondarySchoolSubjectsOldChange(upperSecondarySchoolSubjectsOld);

        if (upperSecondarySchoolSubjectsOld.length > 0) {
          this.currentUpperSecondarySchoolSelected.setValue(true);
        }

        const upperSecondarySchoolCoursesOld = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryCoursesOld);
        this.upperSecondarySchoolCoursesOldCtrl.setValue(upperSecondarySchoolCoursesOld);

        const upperSecondarySchoolObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryObjectives);
        this.upperSecondarySchoolObjectives.setValue(upperSecondarySchoolObjectives);

        if (upperSecondarySchoolSubjectsOld.length > 0 && 'educationalFramework' in upperSecondarySchoolSubjectsOld[0]) {
          // tslint:disable-next-line:max-line-length
          this.upperSecondarySchoolFramework.setValue(upperSecondarySchoolSubjectsOld[0].educationalFramework);
        }

        // upper secondary school (new)
        const upperSecondarySchoolSubjectsNew = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondarySubjectsNew);
        this.upperSecondarySchoolSubjectsNewCtrl.setValue(upperSecondarySchoolSubjectsNew);
        this.upperSecondarySchoolSubjectsNewChange(upperSecondarySchoolSubjectsNew);

        if (upperSecondarySchoolSubjectsNew.length > 0) {
          this.newUpperSecondarySchoolSelected.setValue(true);
        }

        const upperSecondarySchoolModulesNew = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryModulesNew);
        this.upperSecondarySchoolModulesNewCtrl.setValue(upperSecondarySchoolModulesNew);
        this.upperSecondarySchoolModulesNewChange(upperSecondarySchoolModulesNew);

        const upperSecondarySchoolObjectivesNew = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryObjectivesNew);
        this.upperSecondarySchoolObjectivesNewCtrl.setValue(upperSecondarySchoolObjectivesNew);

        const upperSecondarySchoolContentsNew = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryContentsNew);
        this.upperSecondarySchoolContentsNewCtrl.setValue(upperSecondarySchoolContentsNew);

        // vocational education
        const vocationalDegrees = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.vocationalDegrees);
        this.vocationalDegreesCtrl.setValue(vocationalDegrees);
        this.vocationalDegreesChange();

        const vocationalUnits = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.vocationalUnits);
        this.vocationalUnitsCtrl.setValue(vocationalUnits);
        this.vocationalUnitsChange(vocationalUnits);

        const vocationalRequirements = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.vocationalRequirements);
        this.vocationalRequirementsCtrl.setValue(vocationalRequirements);

        if (vocationalDegrees.length > 0 && 'educationalFramework' in vocationalDegrees[0]) {
          // tslint:disable-next-line:max-line-length
          this.vocationalEducationFramework.setValue(vocationalDegrees[0].educationalFramework);
        }

        const furtherVocationalQualifications = this.savedData.alignmentObjects
          .filter((aObject: AlignmentObjectExtended) => aObject.source === koodistoSources.furtherVocationalQualifications);
        this.furtherVocationalQualificationsCtrl.setValue(furtherVocationalQualifications);
        this.vocationalDegreesChange();

        const specialistVocationalQualifications = this.savedData.alignmentObjects
          .filter((aObject: AlignmentObjectExtended) => aObject.source === koodistoSources.specialistVocationalQualifications);
        this.specialistVocationalQualificationsCtrl.setValue(specialistVocationalQualifications);
        this.vocationalDegreesChange();

        // self-motivated competence development
        const selfMotivatedEducationSubjects = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.selfMotivatedSubjects);
        this.selfMotivatedEducationSubjects.setValue(selfMotivatedEducationSubjects);

        const selfMotivatedEducationObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.selfMotivatedObjectives);
        this.selfMotivatedEducationObjectives.setValue(selfMotivatedEducationObjectives);

        // higher education
        const branchesOfScience = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.scienceBranches);
        this.branchesOfScience.setValue(branchesOfScience);

        const scienceBranchObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.scienceBranchObjectives);
        this.scienceBranchObjectives.setValue(scienceBranchObjectives);

        if (branchesOfScience.length > 0 && 'educationalFramework' in branchesOfScience[0]) {
          // tslint:disable-next-line:max-line-length
          this.higherEducationFramework.setValue(branchesOfScience[0].educationalFramework);
        }
      }

      if (this.savedData.suitsAllEarlyChildhoodSubjects) {
        this.suitsAllEarlyChildhoodSubjects.setValue(this.savedData.suitsAllEarlyChildhoodSubjects);
      }

      if (this.savedData.suitsAllPrePrimarySubjects) {
        this.suitsAllPrePrimarySubjects.setValue(this.savedData.suitsAllPrePrimarySubjects);
      }

      if (this.savedData.suitsAllBasicStudySubjects) {
        this.suitsAllBasicStudySubjects.setValue(this.savedData.suitsAllBasicStudySubjects);
      }

      if (this.savedData.suitsAllUpperSecondarySubjects) {
        this.suitsAllUpperSecondarySubjects.setValue(this.savedData.suitsAllUpperSecondarySubjects);
      }

      if (this.savedData.suitsAllUpperSecondarySubjectsNew) {
        this.suitsAllUpperSecondarySubjectsNew.setValue(this.savedData.suitsAllUpperSecondarySubjectsNew);
      }

      if (this.savedData.suitsAllVocationalDegrees) {
        this.suitsAllVocationalDegrees.setValue(this.savedData.suitsAllVocationalDegrees);
      }

      if (this.savedData.suitsAllSelfMotivatedSubjects) {
        this.suitsAllSelfMotivatedSubjects.setValue(this.savedData.suitsAllSelfMotivatedSubjects);
      }

      if (this.savedData.suitsAllBranches) {
        this.suitsAllBranches.setValue(this.savedData.suitsAllBranches);
      }
    }
  }

  ngOnDestroy(): void {
    // save data if its valid, dirty and not submitted
    if (this.submitted === false && this.form.dirty && this.form.valid) {
      this.saveData();
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
    this.vocationalRequirementSubscription.unsubscribe();
    this.furtherVocationalQualificationSubscription.unsubscribe();
    this.specialistVocationalQualificationSubscription.unsubscribe();
    this.scienceBranchSubscription.unsubscribe();
  }

  setTitle(): void {
    this.translate.get('titles.addMaterial').subscribe((translations: any) => {
      this.titleSvc.setTitle(`${translations.main}: ${translations.education} ${environment.title}`);
    });
  }

  get educationalLevelsCtrl(): FormControl {
    return this.form.get('educationalLevels') as FormControl;
  }

  get earlyChildhoodEducationSubjects(): FormControl {
    return this.form.get('earlyChildhoodEducationSubjects') as FormControl;
  }

  get suitsAllEarlyChildhoodSubjects(): FormControl {
    return this.form.get('suitsAllEarlyChildhoodSubjects') as FormControl;
  }

  get earlyChildhoodEducationObjectives(): FormControl {
    return this.form.get('earlyChildhoodEducationObjectives') as FormControl;
  }

  get earlyChildhoodEducationFramework(): FormControl {
    return this.form.get('earlyChildhoodEducationFramework') as FormControl;
  }

  get prePrimaryEducationSubjects(): FormControl {
    return this.form.get('prePrimaryEducationSubjects') as FormControl;
  }

  get suitsAllPrePrimarySubjects(): FormControl {
    return this.form.get('suitsAllPrePrimarySubjects') as FormControl;
  }

  get prePrimaryEducationObjectives(): FormControl {
    return this.form.get('prePrimaryEducationObjectives') as FormControl;
  }

  get prePrimaryEducationFramework(): FormControl {
    return this.form.get('prePrimaryEducationFramework') as FormControl;
  }

  get basicStudySubjectsCtrl(): FormControl {
    return this.form.get('basicStudySubjects') as FormControl;
  }

  get suitsAllBasicStudySubjects(): FormControl {
    return this.form.get('suitsAllBasicStudySubjects') as FormControl;
  }

  get basicStudyObjectivesCtrl(): FormControl {
    return this.form.get('basicStudyObjectives') as FormControl;
  }

  get basicStudyContentsCtrl(): FormControl {
    return this.form.get('basicStudyContents') as FormControl;
  }

  get basicStudyFramework(): FormControl {
    return this.form.get('basicStudyFramework') as FormControl;
  }

  get currentUpperSecondarySchoolSelected(): FormControl {
    return this.form.get('currentUpperSecondarySchoolSelected') as FormControl;
  }

  get newUpperSecondarySchoolSelected(): FormControl {
    return this.form.get('newUpperSecondarySchoolSelected') as FormControl;
  }

  get suitsAllUpperSecondarySubjects(): FormControl {
    return this.form.get('suitsAllUpperSecondarySubjects') as FormControl;
  }

  get upperSecondarySchoolObjectives(): FormControl {
    return this.form.get('upperSecondarySchoolObjectives') as FormControl;
  }

  get upperSecondarySchoolFramework(): FormControl {
    return this.form.get('upperSecondarySchoolFramework') as FormControl;
  }

  get upperSecondarySchoolSubjectsOldCtrl(): FormControl {
    return this.form.get('upperSecondarySchoolSubjectsOld') as FormControl;
  }

  get upperSecondarySchoolCoursesOldCtrl(): FormControl {
    return this.form.get('upperSecondarySchoolCoursesOld') as FormControl;
  }

  get upperSecondarySchoolSubjectsNewCtrl(): FormControl {
    return this.form.get('upperSecondarySchoolSubjectsNew') as FormControl;
  }

  get suitsAllUpperSecondarySubjectsNew(): FormControl {
    return this.form.get('suitsAllUpperSecondarySubjectsNew') as FormControl;
  }

  get upperSecondarySchoolModulesNewCtrl(): FormControl {
    return this.form.get('upperSecondarySchoolModulesNew') as FormControl;
  }

  get upperSecondarySchoolObjectivesNewCtrl(): FormControl {
    return this.form.get('upperSecondarySchoolObjectivesNew') as FormControl;
  }

  get upperSecondarySchoolContentsNewCtrl(): FormControl {
    return this.form.get('upperSecondarySchoolContentsNew') as FormControl;
  }

  get vocationalDegreesCtrl(): FormControl {
    return this.form.get('vocationalDegrees') as FormControl;
  }

  get suitsAllVocationalDegrees(): FormControl {
    return this.form.get('suitsAllVocationalDegrees') as FormControl;
  }

  get vocationalUnitsCtrl(): FormControl {
    return this.form.get('vocationalUnits') as FormControl;
  }

  get vocationalRequirementsCtrl(): FormControl {
    return this.form.get('vocationalRequirements') as FormControl;
  }

  get vocationalEducationFramework(): FormControl {
    return this.form.get('vocationalEducationFramework') as FormControl;
  }

  get furtherVocationalQualificationsCtrl(): FormControl {
    return this.form.get('furtherVocationalQualifications') as FormControl;
  }

  get specialistVocationalQualificationsCtrl(): FormControl {
    return this.form.get('specialistVocationalQualifications') as FormControl;
  }

  get selfMotivatedEducationSubjects(): FormControl {
    return this.form.get('selfMotivatedEducationSubjects') as FormControl;
  }

  get suitsAllSelfMotivatedSubjects(): FormControl {
    return this.form.get('suitsAllSelfMotivatedSubjects') as FormControl;
  }

  get selfMotivatedEducationObjectives(): FormControl {
    return this.form.get('selfMotivatedEducationObjectives') as FormControl;
  }

  get branchesOfScience(): FormControl {
    return this.form.get('branchesOfScience') as FormControl;
  }

  get suitsAllBranches(): FormControl {
    return this.form.get('suitsAllBranches') as FormControl;
  }

  get scienceBranchObjectives(): FormControl {
    return this.form.get('scienceBranchObjectives') as FormControl;
  }

  get higherEducationFramework(): FormControl {
    return this.form.get('higherEducationFramework') as FormControl;
  }

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

  basicStudySubjectsChange(value): void {
    this.hasBasicStudySubjects = value.length > 0;

    if (this.hasBasicStudySubjects) {
      const ids = value.map((subject: AlignmentObjectExtended) => subject.key).join(',');

      this.koodistoProxySvc.updateBasicStudyObjectives(ids);
      this.koodistoProxySvc.updateBasicStudyContents(ids);
    }
  }

  upperSecondarySchoolSubjectsOldChange(value): void {
    this.hasUpperSecondarySchoolSubjectsOld = value.length > 0;

    if (this.hasUpperSecondarySchoolSubjectsOld) {
      const ids = value.map((subject: AlignmentObjectExtended) => subject.key).join(',');

      this.koodistoProxySvc.updateUpperSecondarySchoolCoursesOld(ids);
    }
  }

  upperSecondarySchoolSubjectsNewChange(value): void {
    this.hasUpperSecondarySchoolSubjectsNew = value.length > 0;

    if (this.hasUpperSecondarySchoolSubjectsNew) {
      const ids = value.map((subject: AlignmentObjectExtended) => subject.key).join(',');

      this.koodistoProxySvc.updateUpperSecondarySchoolModulesNew(ids);
    }
  }

  upperSecondarySchoolModulesNewChange(value): void {
    this.hasUpperSecondarySchoolModulesNew = value.length > 0;

    if (this.hasUpperSecondarySchoolModulesNew) {
      const ids = value.map((subject: AlignmentObjectExtended) => subject.key).join(',');

      this.koodistoProxySvc.updateUpperSecondarySchoolObjectivesNew(ids);
      this.koodistoProxySvc.updateUpperSecondarySchoolContentsNew(ids);
    }
  }

  vocationalDegreesChange(): void {
    const basicDegrees = this.vocationalDegreesCtrl.value;
    const furtherVocationalQualifications = this.furtherVocationalQualificationsCtrl.value;
    const specialistVocationalQualifications = this.specialistVocationalQualificationsCtrl.value;
    const degrees = basicDegrees.concat(furtherVocationalQualifications, specialistVocationalQualifications);

    this.hasVocationalDegrees = degrees.length > 0;

    if (this.hasVocationalDegrees) {
      const ids = degrees.map((degree: AlignmentObjectExtended) => degree.key).join(',');

      this.koodistoProxySvc.updateVocationalUnits(ids);
    }
  }

  vocationalUnitsChange(value): void {
    this.hasVocationalUnits = value.length > 0;

    if (this.hasVocationalUnits) {
      const ids = value.map((degree: AlignmentObjectExtended) => degree.key).join(',');

      this.koodistoProxySvc.updateVocationalRequirements(ids);
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.valid) {
      if (this.form.dirty) {
        this.saveData();
      }

      this.router.navigate(['/lisaa-oppimateriaali', 4]);
    }
  }

  saveData(): void {
    if (this.earlyChildhoodEducationSubjects.value) {
      this.earlyChildhoodEducationSubjects.value.forEach((subject: AlignmentObjectExtended) => {
        const earlyChildhoodEducationFramework = this.earlyChildhoodEducationFramework.value;

        if (earlyChildhoodEducationFramework) {
          subject.educationalFramework = earlyChildhoodEducationFramework;
        }

        this.alignmentObjects.push(subject);
      });
    }

    if (this.earlyChildhoodEducationObjectives.value) {
      this.alignmentObjects = this.alignmentObjects.concat(this.earlyChildhoodEducationObjectives.value);
    }

    if (this.prePrimaryEducationSubjects.value) {
      this.prePrimaryEducationSubjects.value.forEach((subject: AlignmentObjectExtended) => {
        const prePrimaryEducationFramework = this.prePrimaryEducationFramework.value;

        if (prePrimaryEducationFramework) {
          subject.educationalFramework = prePrimaryEducationFramework;
        }

        this.alignmentObjects.push(subject);
      });
    }

    if (this.prePrimaryEducationObjectives.value) {
      this.alignmentObjects = this.alignmentObjects.concat(this.prePrimaryEducationObjectives.value);
    }

    if (this.basicStudySubjectsCtrl.value) {
      this.basicStudySubjectsCtrl.value.forEach((subject: AlignmentObjectExtended) => {
        this.alignmentObjects.push({
          key: subject.key,
          source: subject.source,
          alignmentType: subject.alignmentType,
          educationalFramework: this.basicStudyFramework.value,
          targetName: subject.targetName,
          targetUrl: subject.targetUrl,
        });
      });

      if (this.basicStudyObjectivesCtrl.value) {
        this.basicStudyObjectivesCtrl.value.forEach((objective: AlignmentObjectExtended) => {
          this.alignmentObjects.push({
            key: objective.key,
            source: objective.source,
            alignmentType: objective.alignmentType,
            educationalFramework: this.basicStudyFramework.value,
            targetName: objective.targetName,
            targetUrl: objective.targetUrl,
          });
        });
      }

      if (this.basicStudyContentsCtrl.value) {
        this.basicStudyContentsCtrl.value.forEach((content: AlignmentObjectExtended) => {
          this.alignmentObjects.push({
            key: content.key,
            source: content.source,
            alignmentType: content.alignmentType,
            educationalFramework: this.basicStudyFramework.value,
            targetName: content.targetName,
            targetUrl: content.targetUrl,
          });
        });
      }
    }

    if (this.upperSecondarySchoolObjectives.value) {
      this.alignmentObjects = this.alignmentObjects.concat(this.upperSecondarySchoolObjectives.value);
    }

    if (this.upperSecondarySchoolSubjectsOldCtrl.value) {
      this.upperSecondarySchoolSubjectsOldCtrl.value.forEach((subject: AlignmentObjectExtended) => {
        const upperSecondarySchoolFramework = this.upperSecondarySchoolFramework.value;

        if (upperSecondarySchoolFramework) {
          subject.educationalFramework = upperSecondarySchoolFramework;
        }

        this.alignmentObjects.push(subject);
      });

      if (this.upperSecondarySchoolCoursesOldCtrl.value) {
        this.upperSecondarySchoolCoursesOldCtrl.value.forEach((course: AlignmentObjectExtended) => {
          delete course.parent;
          this.alignmentObjects.push(course);
        });
      }
    }

    if (this.upperSecondarySchoolSubjectsNewCtrl.value) {
      this.alignmentObjects = this.alignmentObjects.concat(this.upperSecondarySchoolSubjectsNewCtrl.value);

      if (this.upperSecondarySchoolModulesNewCtrl.value) {
        this.alignmentObjects = this.alignmentObjects.concat(this.upperSecondarySchoolModulesNewCtrl.value);

        if (this.upperSecondarySchoolObjectivesNewCtrl.value) {
          this.upperSecondarySchoolObjectivesNewCtrl.value.forEach((objective: AlignmentObjectExtended) => {
            delete objective.parent;
            this.alignmentObjects.push(objective);
          });
        }

        if (this.upperSecondarySchoolContentsNewCtrl.value) {
          this.upperSecondarySchoolContentsNewCtrl.value.forEach((content: AlignmentObjectExtended) => {
            delete content.parent;
            this.alignmentObjects.push(content);
          });
        }
      }
    }

    if (this.vocationalDegreesCtrl.value) {
      this.vocationalDegreesCtrl.value.forEach((degree: AlignmentObjectExtended) => {
        const vocationalEducationFramework = this.vocationalEducationFramework.value;

        if (vocationalEducationFramework) {
          degree.educationalFramework = vocationalEducationFramework;
        }

        this.alignmentObjects.push(degree);
      });

      if (this.vocationalUnitsCtrl.value) {
        this.vocationalUnitsCtrl.value.forEach((unit: AlignmentObjectExtended) => {
          delete unit.parent;
          this.alignmentObjects.push(unit);
        });

        if (this.vocationalRequirementsCtrl.value) {
          this.vocationalRequirementsCtrl.value.forEach((requirement: AlignmentObjectExtended) => {
            delete requirement.parent;
            this.alignmentObjects.push(requirement);
          });
        }
      }
    }

    if (this.furtherVocationalQualificationsCtrl.value) {
      this.furtherVocationalQualificationsCtrl.value.forEach((qualification: AlignmentObjectExtended) => {
        const framework = this.vocationalEducationFramework.value;

        if (framework) {
          qualification.educationalFramework = framework;
        }

        this.alignmentObjects.push(qualification);
      });
    }

    if (this.specialistVocationalQualificationsCtrl.value) {
      this.specialistVocationalQualificationsCtrl.value.forEach((qualification: AlignmentObjectExtended) => {
        const framework = this.vocationalEducationFramework.value;

        if (framework) {
          qualification.educationalFramework = framework;
        }

        this.alignmentObjects.push(qualification);
      });
    }

    if (this.selfMotivatedEducationSubjects.value) {
      this.alignmentObjects = this.alignmentObjects.concat(this.selfMotivatedEducationSubjects.value);
    }

    if (this.selfMotivatedEducationObjectives.value) {
      this.alignmentObjects = this.alignmentObjects.concat(this.selfMotivatedEducationObjectives.value);
    }

    if (this.branchesOfScience.value) {
      this.branchesOfScience.value.forEach((branch: AlignmentObjectExtended) => {
        const higherEducationFramework = this.higherEducationFramework.value;

        if (higherEducationFramework) {
          branch.educationalFramework = higherEducationFramework;
        }

        this.alignmentObjects.push(branch);
      });
    }

    if (this.scienceBranchObjectives.value) {
      this.alignmentObjects = this.alignmentObjects.concat(this.scienceBranchObjectives.value);
    }

    const suitsAllSubjects = {
      suitsAllEarlyChildhoodSubjects: this.suitsAllEarlyChildhoodSubjects.value,
      suitsAllPrePrimarySubjects: this.suitsAllPrePrimarySubjects.value,
      suitsAllBasicStudySubjects: this.suitsAllBasicStudySubjects.value,
      suitsAllUpperSecondarySubjects: this.suitsAllUpperSecondarySubjects.value,
      suitsAllUpperSecondarySubjectsNew: this.suitsAllUpperSecondarySubjectsNew.value,
      suitsAllVocationalDegrees: this.suitsAllVocationalDegrees.value,
      suitsAllSelfMotivatedSubjects: this.suitsAllSelfMotivatedSubjects.value,
      suitsAllBranches: this.suitsAllBranches.value,
    };

    const data = Object.assign(
      {},
      this.savedData,
      { educationalLevels: this.educationalLevelsCtrl.value },
      { alignmentObjects: this.alignmentObjects },
      suitsAllSubjects
    );

    // save data to session storage
    sessionStorage.setItem(environment.newERLSKey, JSON.stringify(data));
  }

  resetForm() {
    // reset submit status
    this.submitted = false;

    // reset form values
    this.form.reset();

    // clear data from session storage
    sessionStorage.removeItem(environment.newERLSKey);
    sessionStorage.removeItem(environment.fileUploadLSKey);

    this.router.navigateByUrl('/');
  }

  previousTab() {
    this.router.navigate(['/lisaa-oppimateriaali', 2]);
  }
}
