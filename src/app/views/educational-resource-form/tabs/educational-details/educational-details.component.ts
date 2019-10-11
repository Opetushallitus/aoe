import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { KeyValue } from '@angular/common';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { environment } from '../../../../../environments/environment';
import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';
import { getLocalStorageData } from '../../../../shared/shared.module';
import { AlignmentObjectExtended } from '../../../../models/alignment-object-extended';

@Component({
  selector: 'app-tabs-educational-details',
  templateUrl: './educational-details.component.html',
})
export class EducationalDetailsComponent implements OnInit {
  private localStorageKey = environment.newERLSKey;
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
  private earlyChildhoodEducationKeys: string[];
  private prePrimaryEducationKeys: string[];
  private basicStudyKeys: string[];
  private upperSecondarySchoolKeys: string[];
  private vocationalDegreeKeys: string[];
  private selfMotivatedEducationKeys: string[];
  private higherEducationKeys: string[];

  educationalLevels$: any[];
  basicStudySubjects$: any[];
  basicStudyObjectives$: any[] = [];
  // basicStudyObjectivesItems: any[];
  basicStudyContents$: any[] = [];
  // basicStudyContentsItems: any[];
  upperSecondarySchoolSubjects$: KeyValue<string, string>[];
  vocationalDegrees$: KeyValue<number, string>[];
  branchesOfScience$: any[];

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
    });

    this.savedData = getLocalStorageData(this.localStorageKey);

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

    this.koodistoProxySvc.getData('koulutusasteet', this.lang).subscribe(data => {
      this.educationalLevels$ = data;
    });

    this.koodistoProxySvc.getData('oppiaineet', this.lang).subscribe(data => {
      this.basicStudySubjects$ = data;
    });

    this.koodistoProxySvc.getData('tavoitteet', this.lang).subscribe(data => {
      this.basicStudyObjectives$ = data;

      // this.updateBasicStudyObjectives();
    });

    this.koodistoProxySvc.getData('sisaltoalueet', this.lang).subscribe(data => {
      this.basicStudyContents$ = data;

      // this.updateBasicStudyContents();
    });

    this.koodistoProxySvc.getData('lukionkurssit', this.lang).subscribe(data => {
      this.upperSecondarySchoolSubjects$ = data;
    });

    this.koodistoProxySvc.getData('ammatillisentutkinnot', this.lang).subscribe(data => {
      this.vocationalDegrees$ = data;
    });

    this.koodistoProxySvc.getData('tieteenalat', this.lang).subscribe(data => {
      this.branchesOfScience$ = data;
    });

    this.earlyChildhoodEducationKeys = [
      '8e7b8440-286d-4cc9-ad99-9fe288107535',
    ];

    this.prePrimaryEducationKeys = [
      '3ff553ba-a4d7-407c-ad00-80e54ecebd16',
    ];

    this.basicStudyKeys = [
      '8cb1a02f-54cb-499a-b470-4ee980519707',
      '5410475a-a2fb-46d7-9eb4-c572b5d92dbb',
      '7eb3d5be-0575-44db-ab8a-883cf0ae2f26',
      '75e8bed1-b965-483d-8ba4-48a5614c69ba',
      'a2a70a14-b150-4f37-9e20-2bbb71731807',
      '14fe3b08-8516-4999-946b-96eb90c2d563',
    ];

    this.upperSecondarySchoolKeys = [
      '94f79e1e-10e6-483d-b651-27521f94f7bf',
      'fd362a80-9662-48b8-acd1-d8cef520530c',
    ];

    this.vocationalDegreeKeys = [
      '010c6689-5021-4d8e-8c02-68a27cc5a87b',
      '55c5d6a2-8415-47bc-9d15-7b976b0e999c',
      'da5b8f43-5fc9-4681-812b-40846926f3fd',
    ];

    this.selfMotivatedEducationKeys = [
      'bc25d0e7-3c68-49a1-9329-239dae01fab7',
    ];

    this.higherEducationKeys = [
      'e5a48ada-3de0-4246-9b8f-32d4ff68e22f',
      'ff3334db-2a71-4459-8f0d-c42ce2b12a70',
      '9c14f097-68e3-4e6b-a772-71a44442f72f',
      '7c722ac4-f06c-4f2a-a41f-b0c5aa10070a',
    ];

    if (this.savedData) {
      if (this.savedData.educationalLevels) {
        this.educationalLevels.setValue(this.savedData.educationalLevels);

        this.educationalLevelsChange(this.savedData.educationalLevels);
      }

      if (this.savedData.alignmentObjects) {
        // early childhood education
        const earlyChildhoodEducationSubjects = this.savedData.alignmentObjects
          .filter(alignmentObject => alignmentObject.source === 'earlyChildhoodEducationSubjects');
        this.earlyChildhoodEducationSubjects.setValue(earlyChildhoodEducationSubjects);

        const earlyChildhoodEducationObjectives = this.savedData.alignmentObjects
          .filter(alignmentObject => alignmentObject.source === 'earlyChildhoodEducationObjectives');
        this.earlyChildhoodEducationObjectives.setValue(earlyChildhoodEducationObjectives);

        if (earlyChildhoodEducationSubjects.length > 0 && 'educationalFramework' in earlyChildhoodEducationSubjects[0]) {
          // tslint:disable-next-line:max-line-length
          this.earlyChildhoodEducationFramework.setValue(earlyChildhoodEducationSubjects[0].educationalFramework);
        }

        // pre-primary education
        const prePrimaryEducationSubjects = this.savedData.alignmentObjects
          .filter(alignmentObject => alignmentObject.source === 'prePrimaryEducationSubjects');
        this.prePrimaryEducationSubjects.setValue(prePrimaryEducationSubjects);

        const prePrimaryEducationObjectives = this.savedData.alignmentObjects
          .filter(alignmentObject => alignmentObject.source === 'prePrimaryEducationObjectives');
        this.prePrimaryEducationObjectives.setValue(prePrimaryEducationObjectives);

        if (prePrimaryEducationSubjects.length > 0 && 'educationalFramework' in prePrimaryEducationSubjects[0]) {
          // tslint:disable-next-line:max-line-length
          this.prePrimaryEducationFramework.setValue(prePrimaryEducationSubjects[0].educationalFramework);
        }

        // basic education
        const basicStudySubjects = this.savedData.alignmentObjects
          .filter(alignmentObject => alignmentObject.source === 'basicStudySubjects');
        this.basicStudySubjects.setValue(basicStudySubjects);
        this.basicStudySubjectsChange(basicStudySubjects);

        if (basicStudySubjects.length > 0 && 'educationalFramework' in basicStudySubjects[0]) {
          // tslint:disable-next-line:max-line-length
          this.basicStudyFramework.setValue(basicStudySubjects[0].educationalFramework);
        }

        // upper secondary school
        const upperSecondarySchoolSubjects = this.savedData.alignmentObjects
          .filter(alignmentObject => alignmentObject.source === 'upperSecondarySchoolSubjects');
        this.upperSecondarySchoolSubjects.setValue(upperSecondarySchoolSubjects);

        const upperSecondarySchoolObjectives = this.savedData.alignmentObjects
          .filter(alignmentObject => alignmentObject.source === 'upperSecondarySchoolObjectives');
        this.upperSecondarySchoolObjectives.setValue(upperSecondarySchoolObjectives);

        if (upperSecondarySchoolSubjects.length > 0 && 'educationalFramework' in upperSecondarySchoolSubjects[0]) {
          // tslint:disable-next-line:max-line-length
          this.upperSecondarySchoolFramework.setValue(upperSecondarySchoolSubjects[0].educationalFramework);
        }

        // vocational education
        const vocationalDegrees = this.savedData.alignmentObjects
          .filter(alignmentObject => alignmentObject.source === 'vocationalDegrees');
        this.vocationalDegrees.setValue(vocationalDegrees);

        const vocationalEducationObjectives = this.savedData.alignmentObjects
          .filter(alignmentObject => alignmentObject.source === 'vocationalEducationObjectives');
        this.vocationalEducationObjectives.setValue(vocationalEducationObjectives);

        if (vocationalDegrees.length > 0 && 'educationalFramework' in vocationalDegrees[0]) {
          // tslint:disable-next-line:max-line-length
          this.vocationalEducationFramework.setValue(vocationalDegrees[0].educationalFramework);
        }

        // self-motivated competence development
        const selfMotivatedEducationSubjects = this.savedData.alignmentObjects
          .filter(alignmentObject => alignmentObject.source === 'selfMotivatedEducationSubjects');
        this.selfMotivatedEducationSubjects.setValue(selfMotivatedEducationSubjects);

        const selfMotivatedEducationObjectives = this.savedData.alignmentObjects
          .filter(alignmentObject => alignmentObject.source === 'selfMotivatedEducationObjectives');
        this.selfMotivatedEducationObjectives.setValue(selfMotivatedEducationObjectives);

        // higher education
        const branchesOfScience = this.savedData.alignmentObjects
          .filter(alignmentObject => alignmentObject.source === 'branchesOfScience');
        this.branchesOfScience.setValue(branchesOfScience);

        const scienceBranchObjectives = this.savedData.alignmentObjects
          .filter(alignmentObject => alignmentObject.source === 'scienceBranchObjectives');
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

  get educationalLevels(): FormControl {
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

  get basicStudySubjects(): FormControl {
    return this.educationalDetailsForm.get('basicStudySubjects') as FormControl;
  }

  get suitsAllBasicStudySubjects(): FormControl {
    return this.educationalDetailsForm.get('suitsAllBasicStudySubjects') as FormControl;
  }

  get basicStudyObjectives(): FormControl {
    return this.educationalDetailsForm.get('basicStudyObjectives') as FormControl;
  }

  get basicStudyContents(): FormControl {
    return this.educationalDetailsForm.get('basicStudyContents') as FormControl;
  }

  get basicStudyFramework(): FormControl {
    return this.educationalDetailsForm.get('basicStudyFramework') as FormControl;
  }

  get upperSecondarySchoolSubjects(): FormControl {
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

  get vocationalDegrees(): FormControl {
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
    this.hasEarlyChildhoodEducation = value.filter((e: any) => this.earlyChildhoodEducationKeys.includes(e.key)).length > 0;

    this.hasPrePrimaryEducation = value.filter((e: any) => this.prePrimaryEducationKeys.includes(e.key)).length > 0;

    this.hasBasicStudies = value.filter((e: any) => this.basicStudyKeys.includes(e.key)).length > 0;

    if (this.hasBasicStudies === false) {
      this.hasBasicStudySubjects = false;
    }

    this.hasUpperSecondarySchool = value.filter((e: any) => this.upperSecondarySchoolKeys.includes(e.key)).length > 0;

    this.hasVocationalDegree = value.filter((e: any) => this.vocationalDegreeKeys.includes(e.key)).length > 0;

    this.hasSelfMotivatedEducation = value.filter((e: any) => this.selfMotivatedEducationKeys.includes(e.key)).length > 0;

    this.hasHigherEducation = value.filter((e: any) => this.higherEducationKeys.includes(e.key)).length > 0;
  }

  basicStudySubjectsChange(value): void {
    this.hasBasicStudySubjects = value.length > 0;

    /*if (this.hasBasicStudySubjects) {
      this.basicStudyObjectivesItems = [];
      this.basicStudyContentsItems = [];

      value.forEach(subject => {
        this.basicStudyObjectives$
          .filter((objective: AlignmentObjectExtended) => objective.parent === subject.key)
          .forEach((objective: AlignmentObjectExtended) => this.basicStudyObjectivesItems.push(objective));

        this.basicStudyContents$
          .filter((content: AlignmentObjectExtended) => content.parent === subject.key)
          .forEach((content: AlignmentObjectExtended) => this.basicStudyContentsItems.push(content));
      });
    }*/
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

  /*private updateBasicStudyObjectives(): void {
    if (this.savedData && this.savedData.alignmentObjects) {
      const basicStudyObjectiveKeys = this.savedData.alignmentObjects
        .filter(alignmentObject => alignmentObject.source === 'basicStudyObjectives')
        .map(objective => objective.key);

      const basicStudyObjectives = this.basicStudyObjectives$.map(objective => {
        if (basicStudyObjectiveKeys.includes(objective.key)) {
          return objective;
        }
      });

      this.basicStudyObjectives.setValue(basicStudyObjectives);

      if (this.basicStudySubjects.value) {
        this.basicStudySubjectsChange(this.basicStudySubjects.value);
      }
    }
  }*/

  /*private updateBasicStudyContents(): void {
    if (this.savedData && this.savedData.alignmentObjects) {
      const basicStudyContentKeys = this.savedData.alignmentObjects
        .filter(alignmentObject => alignmentObject.source === 'basicStudyContents')
        .map(objective => objective.key);

      const basicStudyContents = this.basicStudyContents$.map(objective => {
        if (basicStudyContentKeys.includes(objective.key)) {
          return objective;
        }
      });

      this.basicStudyContents.setValue(basicStudyContents);

      if (this.basicStudySubjects.value) {
        this.basicStudySubjectsChange(this.basicStudySubjects.value);
      }
    }
  }*/

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

      if (this.basicStudySubjects.value) {
        this.basicStudySubjects.value.forEach((subject: AlignmentObjectExtended) => {
          this.alignmentObjects.push({
            key: subject.key,
            source: subject.source,
            alignmentType: subject.alignmentType,
            educationalFramework: this.basicStudyFramework.value,
            targetName: subject.targetName
          });
        });

        if (this.basicStudyObjectives.value) {
          this.basicStudyObjectives.value.forEach((objective: AlignmentObjectExtended) => {
            this.alignmentObjects.push({
              key: objective.key,
              source: objective.source,
              alignmentType: objective.alignmentType,
              educationalFramework: this.basicStudyFramework.value,
              targetName: objective.targetName
            });
          });
        }

        if (this.basicStudyContents.value) {
          this.basicStudyContents.value.forEach((content: AlignmentObjectExtended) => {
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

      if (this.upperSecondarySchoolSubjects.value) {
        this.upperSecondarySchoolSubjects.value.forEach((subject: AlignmentObjectExtended) => {
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

      if (this.vocationalDegrees.value) {
        this.vocationalDegrees.value.forEach((degree: AlignmentObjectExtended) => {
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
        { educationalLevels: this.educationalLevels.value },
        { alignmentObjects: this.alignmentObjects },
        suitsAllSubjects
        );

      // save data to local storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));

      this.router.navigate(['/lisaa-oppimateriaali', 4]);
    }
  }

  // @todo: some kind of confirmation
  resetForm() {
    // reset submit status
    this.submitted = false;

    // reset form values
    this.educationalDetailsForm.reset();

    // clear data from local storage
    localStorage.removeItem(this.localStorageKey);
    localStorage.removeItem(this.fileUploadLSKey);
  }

  previousTab() {
    this.router.navigate(['/lisaa-oppimateriaali', 2]);
  }
}
