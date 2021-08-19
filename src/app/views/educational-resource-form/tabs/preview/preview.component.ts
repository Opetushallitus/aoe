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
import { Subtitle } from '@models/subtitle';
import { getUniqueFrameworks } from '../../../../shared/shared.module';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
})
export class PreviewComponent implements OnInit {
  lang: string = this.translate.currentLang;
  savedData: any;
  fileUpload: any;
  canDeactivate = false;

  earlyChildhoodEducationSubjects: AlignmentObjectExtended[];
  earlyChildhoodEducationObjectives: AlignmentObjectExtended[];
  earlyChildhoodEducationFramework: string[];
  prePrimaryEducationSubjects: AlignmentObjectExtended[];
  prePrimaryEducationObjectives: AlignmentObjectExtended[];
  prePrimaryEducationFramework: string[];
  basicStudySubjects: AlignmentObjectExtended[];
  basicStudyObjectives: AlignmentObjectExtended[];
  basicStudyContents: AlignmentObjectExtended[];
  basicStudyFramework: string[];
  upperSecondarySchoolSubjects: AlignmentObjectExtended[];
  upperSecondarySchoolObjectives: AlignmentObjectExtended[];
  upperSecondarySchoolSubjectsOld: AlignmentObjectExtended[];
  upperSecondarySchoolCoursesOld: AlignmentObjectExtended[];
  upperSecondarySchoolFramework: string[];
  upperSecondarySchoolSubjectsNew: AlignmentObjectExtended[];
  upperSecondarySchoolModulesNew: AlignmentObjectExtended[];
  upperSecondarySchoolObjectivesNew: AlignmentObjectExtended[];
  upperSecondarySchoolContentsNew: AlignmentObjectExtended[];
  // upperSecondarySchoolFrameworkNew: string[];
  vocationalDegrees: AlignmentObjectExtended[];
  vocationalUnits: AlignmentObjectExtended[];
  vocationalRequirements: AlignmentObjectExtended[];
  furtherVocationalQualifications: AlignmentObjectExtended[];
  specialistVocationalQualifications: AlignmentObjectExtended[];
  vocationalFramework: string[];
  selfMotivatedEducationSubjects: AlignmentObjectExtended[];
  selfMotivatedEducationObjectives: AlignmentObjectExtended[];
  branchesOfScience: AlignmentObjectExtended[];
  scienceBranchObjectives: AlignmentObjectExtended[];
  higherEducationFramework: string[];
  prerequisites: AlignmentObjectExtended[];
  typicalAgeRange: string;

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

        this.form.get('hasMaterial').setValue(this.uploadedFiles?.length > 0);
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

    this.form.get('hasName').setValue(this.savedData?.name?.fi || this.savedData?.name?.sv || this.savedData?.name?.en);
    this.form.get('hasAuthor').setValue(this.savedData?.authors?.length > 0);
    this.form.get('hasKeyword').setValue(this.savedData?.keywords?.length > 0);
    this.form.get('hasLearningResourceType').setValue(this.savedData?.learningResourceTypes?.length > 0);
    this.form.get('hasEducationalLevel').setValue(this.savedData?.educationalLevels?.length > 0);
    this.form.get('hasLicense').setValue(this.savedData?.license);

    this.earlyChildhoodEducationSubjects = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.earlyChildhoodSubjects);

    this.earlyChildhoodEducationObjectives = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.earlyChildhoodObjectives);

    this.earlyChildhoodEducationFramework = getUniqueFrameworks(this.earlyChildhoodEducationSubjects);

    this.prePrimaryEducationSubjects = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.prePrimarySubjects);

    this.prePrimaryEducationObjectives = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.prePrimaryObjectives);

    this.prePrimaryEducationFramework = getUniqueFrameworks(this.prePrimaryEducationSubjects);

    this.basicStudySubjects = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.basicStudySubjects);

    this.basicStudyObjectives = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.basicStudyObjectives);

    this.basicStudyContents = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.basicStudyContents);

    this.basicStudyFramework = getUniqueFrameworks(this.basicStudySubjects);

    this.upperSecondarySchoolSubjects = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondarySubjects);

    this.upperSecondarySchoolObjectives = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryObjectives);

    this.upperSecondarySchoolSubjectsOld = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondarySubjectsOld);

    this.upperSecondarySchoolCoursesOld = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryCoursesOld);

    this.upperSecondarySchoolFramework = getUniqueFrameworks(this.upperSecondarySchoolSubjects);

    this.upperSecondarySchoolSubjectsNew = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondarySubjectsNew);

    this.upperSecondarySchoolModulesNew = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryModulesNew);

    this.upperSecondarySchoolObjectivesNew = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryObjectivesNew);

    this.upperSecondarySchoolContentsNew = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryContentsNew);

    // this.upperSecondarySchoolFrameworkNew = getUniqueFrameworks(this.upperSecondarySchoolSubjectsNew);

    this.vocationalDegrees = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.vocationalDegrees);

    this.vocationalUnits = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.vocationalUnits);

    this.vocationalRequirements = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.vocationalRequirements);

    this.furtherVocationalQualifications = this.savedData?.alignmentObjects
      .filter((aObject: AlignmentObjectExtended) => aObject.source === koodistoSources.furtherVocationalQualifications);

    this.specialistVocationalQualifications = this.savedData?.alignmentObjects
      .filter((aObject: AlignmentObjectExtended) => aObject.source === koodistoSources.specialistVocationalQualifications);

    this.vocationalFramework = getUniqueFrameworks([
      ...this.vocationalDegrees,
      ...this.furtherVocationalQualifications,
      ...this.specialistVocationalQualifications,
    ]);

    this.selfMotivatedEducationSubjects = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.selfMotivatedSubjects);

    this.selfMotivatedEducationObjectives = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.selfMotivatedObjectives);

    this.branchesOfScience = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.scienceBranches);

    this.scienceBranchObjectives = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.scienceBranchObjectives);

    this.higherEducationFramework = getUniqueFrameworks(this.branchesOfScience);

    this.prerequisites = this.savedData?.alignmentObjects
      .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.prerequisites);

    if (this.savedData?.typicalAgeRange?.typicalAgeRangeMin || this.savedData?.typicalAgeRange?.typicalAgeRangeMax) {
      this.typicalAgeRange = `${this.savedData?.typicalAgeRange?.typicalAgeRangeMin ?? ''} - ${this.savedData?.typicalAgeRange?.typicalAgeRangeMax ?? ''}`;
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
      this.canDeactivate = true;

      // new material is always versioned
      this.savedData.isVersioned = true;

      this.savedData.materials = this.uploadedFiles.map((file: UploadedFile, index: number) => {
        return {
          materialId: file.id,
          priority: index,
          attachments: file.subtitles.map((subtitle: Subtitle) => subtitle.id),
        };
      });

      delete this.savedData.thumbnail;
      delete this.savedData.prerequisites;

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
