import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { environment } from '../../../../../environments/environment';
import { BackendService } from '@services/backend.service';
import { AlignmentObjectExtended } from '@models/alignment-object-extended';
import { UploadedFile } from '@models/uploaded-file';
import { koodistoSources } from '../../../../constants/koodisto-sources';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
})
export class PreviewComponent implements OnInit {
  lang: string = this.translate.currentLang;
  savedData: any;
  fileUpload: any;

  earlyChildhoodEducationSubjects: AlignmentObjectExtended[];
  earlyChildhoodEducationObjectives: AlignmentObjectExtended[];
  prePrimaryEducationSubjects: AlignmentObjectExtended[];
  prePrimaryEducationObjectives: AlignmentObjectExtended[];
  basicStudySubjects: AlignmentObjectExtended[];
  basicStudyObjectives: AlignmentObjectExtended[];
  basicStudyContents: AlignmentObjectExtended[];
  upperSecondarySchoolSubjects: AlignmentObjectExtended[];
  upperSecondarySchoolObjectives: AlignmentObjectExtended[];
  upperSecondarySchoolSubjectsNew: AlignmentObjectExtended[];
  upperSecondarySchoolModulesNew: AlignmentObjectExtended[];
  upperSecondarySchoolObjectivesNew: AlignmentObjectExtended[];
  upperSecondarySchoolContentsNew: AlignmentObjectExtended[];
  vocationalDegrees: AlignmentObjectExtended[];
  vocationalUnits: AlignmentObjectExtended[];
  vocationalEducationObjectives: AlignmentObjectExtended[];
  selfMotivatedEducationSubjects: AlignmentObjectExtended[];
  selfMotivatedEducationObjectives: AlignmentObjectExtended[];
  branchesOfScience: AlignmentObjectExtended[];
  scienceBranchObjectives: AlignmentObjectExtended[];
  prerequisites: AlignmentObjectExtended[];

  form: FormGroup;

  uploadedFileSubscription: Subscription;
  uploadedFiles: UploadedFile[];

  materialId: number;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private backendSvc: BackendService,
    private translate: TranslateService,
    private titleSvc: Title,
  ) { }

  ngOnInit() {
    this.setTitle();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.setTitle();
    });

    this.savedData = JSON.parse(sessionStorage.getItem(environment.newERLSKey));
    this.fileUpload = JSON.parse(sessionStorage.getItem(environment.fileUploadLSKey));
    this.materialId = this.fileUpload?.id;

    if (this.materialId) {
      this.uploadedFileSubscription = this.backendSvc.uploadedFiles$.subscribe((uploadedFiles: UploadedFile[]) => {
        this.uploadedFiles = uploadedFiles;
      });

      this.backendSvc.updateUploadedFiles(this.materialId);
    }

    this.form = this.fb.group({
      hasName: this.fb.control(false, [
        Validators.requiredTrue,
      ]),
      hasMaterial: this.fb.control(false, [
        Validators.requiredTrue,
      ]),
      hasAuthor: this.fb.control(false, [
        Validators.requiredTrue,
      ]),
      hasKeyword: this.fb.control(false, [
        Validators.requiredTrue,
      ]),
      hasLearningResourceType: this.fb.control(false, [
        Validators.requiredTrue,
      ]),
      hasEducationalLevel: this.fb.control(false, [
        Validators.requiredTrue,
      ]),
      hasLicense: this.fb.control(false, [
        Validators.requiredTrue,
      ]),
      confirm: this.fb.control(false, [
        Validators.requiredTrue,
      ]),
    });

    if (this.savedData) {
      if (this.savedData.name) {
        if (this.savedData.name.fi || this.savedData.name.sv || this.savedData.name.en) {
          this.form.get('hasName').setValue(true);
        }
      }

      if (this.savedData.authors) {
        if (this.savedData.authors.length > 0) {
          this.form.get('hasAuthor').setValue(true);
        }
      }

      if (this.savedData.keywords) {
        if (this.savedData.keywords.length > 0) {
          this.form.get('hasKeyword').setValue(true);
        }
      }

      if (this.savedData.learningResourceTypes) {
        if (this.savedData.learningResourceTypes.length > 0) {
          this.form.get('hasLearningResourceType').setValue(true);
        }
      }

      if (this.savedData.educationalLevels) {
        if (this.savedData.educationalLevels.length > 0) {
          this.form.get('hasEducationalLevel').setValue(true);
        }
      }

      if (this.savedData.license) {
        this.form.get('hasLicense').setValue(true);
      }

      if (this.savedData.alignmentObjects) {
        this.earlyChildhoodEducationSubjects = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.earlyChildhoodSubjects);

        this.earlyChildhoodEducationObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.earlyChildhoodObjectives);

        // @todo: framework

        this.prePrimaryEducationSubjects = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.prePrimarySubjects);

        this.prePrimaryEducationObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.prePrimaryObjectives);

        this.basicStudySubjects = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.basicStudySubjects);

        this.basicStudyObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.basicStudyObjectives);

        this.basicStudyContents = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.basicStudyContents);

        this.upperSecondarySchoolSubjects = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondarySubjects);

        this.upperSecondarySchoolObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryObjectives);

        this.upperSecondarySchoolSubjectsNew = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondarySubjectsNew);

        this.upperSecondarySchoolModulesNew = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryModulesNew);

        this.upperSecondarySchoolObjectivesNew = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryObjectivesNew);

        this.upperSecondarySchoolContentsNew = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryContentsNew);

        this.vocationalDegrees = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.vocationalDegrees);

        this.vocationalUnits = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.vocationalUnits);

        this.vocationalEducationObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.vocationalObjectives);

        this.selfMotivatedEducationSubjects = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.selfMotivatedSubjects);

        this.selfMotivatedEducationObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.selfMotivatedObjectives);

        this.branchesOfScience = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.scienceBranches);

        this.scienceBranchObjectives = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.scienceBranchObjectives);

        this.prerequisites = this.savedData.alignmentObjects
          .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.prerequisites);
      }
    }
  }

  setTitle(): void {
    this.translate.get('titles.addMaterial').subscribe((translations: any) => {
      this.titleSvc.setTitle(`${translations.main}: ${translations.preview} ${environment.title}`);
    });
  }

  drop(event: CdkDragDrop<UploadedFile[]>) {
    moveItemInArray(this.uploadedFiles, event.previousIndex, event.currentIndex);
  }

  get hasName(): boolean {
    return this.form.get('hasName').value;
  }

  get hasMaterial(): boolean {
    return this.form.get('hasMaterial').value;
  }

  get hasAuthor(): boolean {
    return this.form.get('hasAuthor').value;
  }

  get hasKeyword(): boolean {
    return this.form.get('hasKeyword').value;
  }

  get hasLearningResourceType(): boolean {
    return this.form.get('hasLearningResourceType').value;
  }

  get hasEducationalLevel(): boolean {
    return this.form.get('hasEducationalLevel').value;
  }

  get hasLicense(): boolean {
    return this.form.get('hasLicense').value;
  }

  onSubmit() {
    if (this.form.valid) {
      // new material is always versioned
      this.savedData.isVersioned = true;

      this.savedData.materials = this.uploadedFiles.map((file: UploadedFile, index: number) => {
        return {
          materialId: file.id,
          priority: index,
        };
      });

      delete this.savedData.thumbnail;

      this.backendSvc.postMeta(+this.fileUpload.id, this.savedData).subscribe(() => {
        // clean up session storage
        sessionStorage.removeItem(environment.newERLSKey);
        sessionStorage.removeItem(environment.fileUploadLSKey);

        // redirect to new material
        this.router.navigate([ '/materiaali', this.fileUpload.id ]);
      });
    }
  }

  // @todo: some kind of confirmation
  resetForm() {
    // reset form values
    this.form.reset();

    // clear data from session storage
    sessionStorage.removeItem(environment.newERLSKey);
    sessionStorage.removeItem(environment.fileUploadLSKey);

    this.router.navigateByUrl('/');
  }

  previousTab() {
    this.router.navigate(['/lisaa-oppimateriaali', 6]);
  }
}
