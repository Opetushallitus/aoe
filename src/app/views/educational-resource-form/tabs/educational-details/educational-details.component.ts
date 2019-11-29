import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { environment } from '../../../../../environments/environment';
import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';
import { AlignmentObjectExtended } from '../../../../models/alignment-object-extended';
import { EducationalLevel } from '../../../../models/koodisto-proxy/educational-level';
import { educationalLevelKeys } from '../../../../constants/educational-level-keys';

@Component({
  selector: 'app-tabs-educational-details',
  templateUrl: './educational-details.component.html',
})
export class EducationalDetailsComponent implements OnInit, OnDestroy {
  private savedDataKey = environment.newERLSKey;
  private fileUploadLSKey = environment.fileUploadLSKey;
  lang: string = this.translate.currentLang;
  savedData: any;

  educationalDetailsForm: FormGroup;
  submitted = false;
  hasEarlyChildhoodEducation = false;
  hasPrePrimaryEducation = false;
  hasBasicStudies = false;
  hasBasicStudySubjects = false;
  hasUpperSecondarySchool = false;
  hasVocationalDegree = false;
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
  upperSecondarySchoolSubjectSubscription: Subscription;
  upperSecondarySchoolSubjects: AlignmentObjectExtended[];
  vocationalDegreeSubscription: Subscription;
  vocationalDegrees: AlignmentObjectExtended[];
  scienceBranchSubscription: Subscription;
  scienceBranches: AlignmentObjectExtended[];

  private alignmentObjects: AlignmentObjectExtended[] = [];

  constructor(
    private fb: FormBuilder,
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.koodistoProxySvc.updateEducationalLevels();
      this.koodistoProxySvc.updateBasicStudySubjects();
      this.koodistoProxySvc.updateUpperSecondarySchoolSubjects();
      this.koodistoProxySvc.updateVocationalDegrees();
      this.koodistoProxySvc.updateScienceBranches();
    });

    this.savedData = JSON.parse(sessionStorage.getItem(this.savedDataKey));

    this.educationalDetailsForm = this.fb.group({
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
      upperSecondarySchoolSubjects: this.fb.control(null),
      suitsAllUpperSecondarySubjects: this.fb.control(false),
      upperSecondarySchoolObjectives: this.fb.control(null),
      upperSecondarySchoolFramework: this.fb.control(null),
      vocationalDegrees: this.fb.control(null),
      suitsAllVocationalDegrees: this.fb.control(false),
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

    this.upperSecondarySchoolSubjectSubscription = this.koodistoProxySvc.upperSecondarySchoolSubjects$
      .subscribe((upperSecondarySchoolSubjects: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolSubjects = upperSecondarySchoolSubjects;
      });
    this.koodistoProxySvc.updateUpperSecondarySchoolSubjects();

    this.vocationalDegreeSubscription = this.koodistoProxySvc.vocationalDegrees$
      .subscribe((vocationalDegrees: AlignmentObjectExtended[]) => {
        this.vocationalDegrees = vocationalDegrees;
      });
    this.koodistoProxySvc.updateVocationalDegrees();

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
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'earlyChildhoodEducationSubjects');
        this.earlyChildhoodEducationSubjects.setValue(earlyChildhoodEducationSubjects);

        const earlyChildhoodEducationObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'earlyChildhoodEducationObjectives');
        this.earlyChildhoodEducationObjectives.setValue(earlyChildhoodEducationObjectives);

        if (earlyChildhoodEducationSubjects.length > 0 && 'educationalFramework' in earlyChildhoodEducationSubjects[0]) {
          // tslint:disable-next-line:max-line-length
          this.earlyChildhoodEducationFramework.setValue(earlyChildhoodEducationSubjects[0].educationalFramework);
        }

        // pre-primary education
        const prePrimaryEducationSubjects = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'prePrimaryEducationSubjects');
        this.prePrimaryEducationSubjects.setValue(prePrimaryEducationSubjects);

        const prePrimaryEducationObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'prePrimaryEducationObjectives');
        this.prePrimaryEducationObjectives.setValue(prePrimaryEducationObjectives);

        if (prePrimaryEducationSubjects.length > 0 && 'educationalFramework' in prePrimaryEducationSubjects[0]) {
          // tslint:disable-next-line:max-line-length
          this.prePrimaryEducationFramework.setValue(prePrimaryEducationSubjects[0].educationalFramework);
        }

        // basic education
        const basicStudySubjects = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'basicStudySubjects');
        this.basicStudySubjectsCtrl.setValue(basicStudySubjects);
        this.basicStudySubjectsChange(basicStudySubjects);

        const basicStudyObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'basicStudyObjectives');
        this.basicStudyObjectivesCtrl.setValue(basicStudyObjectives);

        const basicStudyContents = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'basicStudyContents');
        this.basicStudyContentsCtrl.setValue(basicStudyContents);

        if (basicStudySubjects.length > 0 && 'educationalFramework' in basicStudySubjects[0]) {
          // tslint:disable-next-line:max-line-length
          this.basicStudyFramework.setValue(basicStudySubjects[0].educationalFramework);
        }

        // upper secondary school
        const upperSecondarySchoolSubjects = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'upperSecondarySchoolSubjects');
        this.upperSecondarySchoolSubjectsCtrl.setValue(upperSecondarySchoolSubjects);

        const upperSecondarySchoolObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'upperSecondarySchoolObjectives');
        this.upperSecondarySchoolObjectives.setValue(upperSecondarySchoolObjectives);

        if (upperSecondarySchoolSubjects.length > 0 && 'educationalFramework' in upperSecondarySchoolSubjects[0]) {
          // tslint:disable-next-line:max-line-length
          this.upperSecondarySchoolFramework.setValue(upperSecondarySchoolSubjects[0].educationalFramework);
        }

        // vocational education
        const vocationalDegrees = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'vocationalDegrees');
        this.vocationalDegreesCtrl.setValue(vocationalDegrees);

        const vocationalEducationObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'vocationalEducationObjectives');
        this.vocationalEducationObjectives.setValue(vocationalEducationObjectives);

        if (vocationalDegrees.length > 0 && 'educationalFramework' in vocationalDegrees[0]) {
          // tslint:disable-next-line:max-line-length
          this.vocationalEducationFramework.setValue(vocationalDegrees[0].educationalFramework);
        }

        // self-motivated competence development
        const selfMotivatedEducationSubjects = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'selfMotivatedEducationSubjects');
        this.selfMotivatedEducationSubjects.setValue(selfMotivatedEducationSubjects);

        const selfMotivatedEducationObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'selfMotivatedEducationObjectives');
        this.selfMotivatedEducationObjectives.setValue(selfMotivatedEducationObjectives);

        // higher education
        const branchesOfScience = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'branchesOfScience');
        this.branchesOfScience.setValue(branchesOfScience);

        const scienceBranchObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'scienceBranchObjectives');
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
    this.educationalLevelSubscription.unsubscribe();
    this.basicStudySubjectSubscription.unsubscribe();
    this.basicStudyObjectiveSubscription.unsubscribe();
    this.basicStudyContentSubscription.unsubscribe();
    this.upperSecondarySchoolSubjectSubscription.unsubscribe();
    this.vocationalDegreeSubscription.unsubscribe();
    this.scienceBranchSubscription.unsubscribe();
  }

  get educationalLevelsCtrl(): FormControl {
    return this.educationalDetailsForm.get('educationalLevels') as FormControl;
  }

  get earlyChildhoodEducationSubjects(): FormControl {
    return this.educationalDetailsForm.get('earlyChildhoodEducationSubjects') as FormControl;
  }

  get suitsAllEarlyChildhoodSubjects(): FormControl {
    return this.educationalDetailsForm.get('suitsAllEarlyChildhoodSubjects') as FormControl;
  }

  get earlyChildhoodEducationObjectives(): FormControl {
    return this.educationalDetailsForm.get('earlyChildhoodEducationObjectives') as FormControl;
  }

  get earlyChildhoodEducationFramework(): FormControl {
    return this.educationalDetailsForm.get('earlyChildhoodEducationFramework') as FormControl;
  }

  get prePrimaryEducationSubjects(): FormControl {
    return this.educationalDetailsForm.get('prePrimaryEducationSubjects') as FormControl;
  }

  get suitsAllPrePrimarySubjects(): FormControl {
    return this.educationalDetailsForm.get('suitsAllPrePrimarySubjects') as FormControl;
  }

  get prePrimaryEducationObjectives(): FormControl {
    return this.educationalDetailsForm.get('prePrimaryEducationObjectives') as FormControl;
  }

  get prePrimaryEducationFramework(): FormControl {
    return this.educationalDetailsForm.get('prePrimaryEducationFramework') as FormControl;
  }

  get basicStudySubjectsCtrl(): FormControl {
    return this.educationalDetailsForm.get('basicStudySubjects') as FormControl;
  }

  get suitsAllBasicStudySubjects(): FormControl {
    return this.educationalDetailsForm.get('suitsAllBasicStudySubjects') as FormControl;
  }

  get basicStudyObjectivesCtrl(): FormControl {
    return this.educationalDetailsForm.get('basicStudyObjectives') as FormControl;
  }

  get basicStudyContentsCtrl(): FormControl {
    return this.educationalDetailsForm.get('basicStudyContents') as FormControl;
  }

  get basicStudyFramework(): FormControl {
    return this.educationalDetailsForm.get('basicStudyFramework') as FormControl;
  }

  get upperSecondarySchoolSubjectsCtrl(): FormControl {
    return this.educationalDetailsForm.get('upperSecondarySchoolSubjects') as FormControl;
  }

  get suitsAllUpperSecondarySubjects(): FormControl {
    return this.educationalDetailsForm.get('suitsAllUpperSecondarySubjects') as FormControl;
  }

  get upperSecondarySchoolObjectives(): FormControl {
    return this.educationalDetailsForm.get('upperSecondarySchoolObjectives') as FormControl;
  }

  get upperSecondarySchoolFramework(): FormControl {
    return this.educationalDetailsForm.get('upperSecondarySchoolFramework') as FormControl;
  }

  get vocationalDegreesCtrl(): FormControl {
    return this.educationalDetailsForm.get('vocationalDegrees') as FormControl;
  }

  get suitsAllVocationalDegrees(): FormControl {
    return this.educationalDetailsForm.get('suitsAllVocationalDegrees') as FormControl;
  }

  get vocationalEducationObjectives(): FormControl {
    return this.educationalDetailsForm.get('vocationalEducationObjectives') as FormControl;
  }

  get vocationalEducationFramework(): FormControl {
    return this.educationalDetailsForm.get('vocationalEducationFramework') as FormControl;
  }

  get selfMotivatedEducationSubjects(): FormControl {
    return this.educationalDetailsForm.get('selfMotivatedEducationSubjects') as FormControl;
  }

  get suitsAllSelfMotivatedSubjects(): FormControl {
    return this.educationalDetailsForm.get('suitsAllSelfMotivatedSubjects') as FormControl;
  }

  get selfMotivatedEducationObjectives(): FormControl {
    return this.educationalDetailsForm.get('selfMotivatedEducationObjectives') as FormControl;
  }

  get branchesOfScience(): FormControl {
    return this.educationalDetailsForm.get('branchesOfScience') as FormControl;
  }

  get suitsAllBranches(): FormControl {
    return this.educationalDetailsForm.get('suitsAllBranches') as FormControl;
  }

  get scienceBranchObjectives(): FormControl {
    return this.educationalDetailsForm.get('scienceBranchObjectives') as FormControl;
  }

  get higherEducationFramework(): FormControl {
    return this.educationalDetailsForm.get('higherEducationFramework') as FormControl;
  }

  educationalLevelsChange(value): void {
    this.hasEarlyChildhoodEducation = value.filter((e: any) => educationalLevelKeys.earlyChildhood.includes(e.key)).length > 0;

    this.hasPrePrimaryEducation = value.filter((e: any) => educationalLevelKeys.prePrimary.includes(e.key)).length > 0;

    this.hasBasicStudies = value.filter((e: any) => educationalLevelKeys.basicStudy.includes(e.key)).length > 0;

    if (this.hasBasicStudies === false) {
      this.hasBasicStudySubjects = false;
    }

    this.hasUpperSecondarySchool = value.filter((e: any) => educationalLevelKeys.upperSecondary.includes(e.key)).length > 0;

    this.hasVocationalDegree = value.filter((e: any) => educationalLevelKeys.vocational.includes(e.key)).length > 0;

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

  addEarlyChildhoodEducationSubject(value): AlignmentObjectExtended {
    return {
      key: value.replace(/[\W_]+/g, ''),
      source: 'earlyChildhoodEducationSubjects',
      alignmentType: 'educationalSubject',
      targetName: value,
    };
  }

  addEarlyChildhoodEducationObjective(value): AlignmentObjectExtended {
    return {
      key: value.replace(/[\W_]+/g, ''),
      source: 'earlyChildhoodEducationObjectives',
      alignmentType: 'teaches',
      targetName: value,
    };
  }

  addPrePrimaryEducationSubject(value): AlignmentObjectExtended {
    return {
      key: value.replace(/[\W_]+/g, ''),
      source: 'prePrimaryEducationSubjects',
      alignmentType: 'educationalSubject',
      targetName: value,
    };
  }

  addPrePrimaryEducationObjective(value): AlignmentObjectExtended {
    return {
      key: value.replace(/[\W_]+/g, ''),
      source: 'prePrimaryEducationObjectives',
      alignmentType: 'teaches',
      targetName: value,
    };
  }

  addUpperSecondarySchoolObjective(value): AlignmentObjectExtended {
    return {
      key: value.replace(/[\W_]+/g, ''),
      source: 'upperSecondarySchoolObjectives',
      alignmentType: 'teaches',
      targetName: value,
    };
  }

  addVocationalEducationObjective(value): AlignmentObjectExtended {
    return {
      key: value.replace(/[\W_]+/g, ''),
      source: 'vocationalEducationObjectives',
      alignmentType: 'teaches',
      targetName: value,
    };
  }

  addSelfMotivatedEducationSubject(value): AlignmentObjectExtended {
    return {
      key: value.replace(/[\W_]+/g, ''),
      source: 'selfMotivatedEducationSubjects',
      alignmentType: 'educationalSubject',
      targetName: value,
    };
  }

  addSelfMotivatedEducationObjective(value): AlignmentObjectExtended {
    return {
      key: value.replace(/[\W_]+/g, ''),
      source: 'selfMotivatedEducationObjectives',
      alignmentType: 'teaches',
      targetName: value,
    };
  }

  addScienceBranchObjectives(value): AlignmentObjectExtended {
    return {
      key: value.replace(/[\W_]+/g, ''),
      source: 'scienceBranchObjectives',
      alignmentType: 'teaches',
      targetName: value,
    };
  }

  onSubmit() {
    this.submitted = true;

    if (this.educationalDetailsForm.valid) {
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
            targetName: subject.targetName
          });
        });

        if (this.basicStudyObjectivesCtrl.value) {
          this.basicStudyObjectivesCtrl.value.forEach((objective: AlignmentObjectExtended) => {
            this.alignmentObjects.push({
              key: objective.key,
              source: objective.source,
              alignmentType: objective.alignmentType,
              educationalFramework: this.basicStudyFramework.value,
              targetName: objective.targetName
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
              targetName: content.targetName
            });
          });
        }
      }

      if (this.upperSecondarySchoolSubjectsCtrl.value) {
        this.upperSecondarySchoolSubjectsCtrl.value.forEach((subject: AlignmentObjectExtended) => {
          const upperSecondarySchoolFramework = this.upperSecondarySchoolFramework.value;

          if (upperSecondarySchoolFramework) {
            subject.educationalFramework = upperSecondarySchoolFramework;
          }

          this.alignmentObjects.push(subject);
        });
      }

      if (this.upperSecondarySchoolObjectives.value) {
        this.alignmentObjects = this.alignmentObjects.concat(this.upperSecondarySchoolObjectives.value);
      }

      if (this.vocationalDegreesCtrl.value) {
        this.vocationalDegreesCtrl.value.forEach((degree: AlignmentObjectExtended) => {
          const vocationalEducationFramework = this.vocationalEducationFramework.value;

          if (vocationalEducationFramework) {
            degree.educationalFramework = vocationalEducationFramework;
          }

          this.alignmentObjects.push(degree);
        });
      }

      if (this.vocationalEducationObjectives.value) {
        this.alignmentObjects = this.alignmentObjects.concat(this.vocationalEducationObjectives.value);
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
      sessionStorage.setItem(this.savedDataKey, JSON.stringify(data));

      this.router.navigate(['/lisaa-oppimateriaali', 4]);
    }
  }

  resetForm() {
    // reset submit status
    this.submitted = false;

    // reset form values
    this.educationalDetailsForm.reset();

    // clear data from session storage
    sessionStorage.removeItem(this.savedDataKey);
    sessionStorage.removeItem(this.fileUploadLSKey);
  }

  previousTab() {
    this.router.navigate(['/lisaa-oppimateriaali', 2]);
  }
}
