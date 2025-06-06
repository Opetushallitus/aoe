import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { EducationalMaterialForm } from '@models/educational-material-form';
import { AlignmentObjectExtended } from '@models/alignment-object-extended';
import { AttachmentDetail, EducationalMaterialPut, Material } from '@models/educational-material-put';
import { ignoredSubjects } from '@constants/ignored-subjects';
import { MaterialService } from '@services/material.service';

@Component({
  selector: 'app-tabs-edit-preview',
  templateUrl: './edit-preview.component.html',
  styleUrls: ['./edit-preview.component.scss'],
})
export class EditPreviewComponent implements OnInit {
  @Input() tabId: number;
  @Input() materialId: number;
  form: FormGroup;
  lang: string;
  submitted = false;
  canDeactivate = false;
  previewMaterial: EducationalMaterialForm;
  @Output() abortEdit = new EventEmitter();
  typicalAgeRange: string;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private materialService: MaterialService,
    private router: Router,
    private titleService: Title,
  ) {}

  ngOnInit(): void {
    this.setTitle();

    this.form = this.fb.group({
      hasName: this.fb.control(false, [Validators.requiredTrue]),
      hasMaterial: this.fb.control(false, [Validators.requiredTrue]),
      hasAuthor: this.fb.control(false, [Validators.requiredTrue]),
      hasKeywords: this.fb.control(false, [Validators.requiredTrue]),
      hasLearningResourceTypes: this.fb.control(false, [Validators.requiredTrue]),
      hasEducationalLevels: this.fb.control(false, [Validators.requiredTrue]),
      shouldHaveBasicEduObjectivesAndContents: this.fb.control(false),
      hasBasicEduObjectives: this.fb.control(false, [Validators.requiredTrue]),
      hasBasicEduContents: this.fb.control(false, [Validators.requiredTrue]),
      shouldHaveUppSecondaryEduObjectivesAndContents: this.fb.control(false),
      hasUpperSecondaryEduObjectives: this.fb.control(false, [Validators.requiredTrue]),
      hasUpperSecondaryEduContents: this.fb.control(false, [Validators.requiredTrue]),
      hasLicense: this.fb.control(false, [Validators.requiredTrue]),
      confirm: this.fb.control(false, [Validators.requiredTrue]),
    });
    this.lang = this.translate.currentLang;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
      this.setTitle();
    });
    this.previewMaterial = this.materialService.getEducationalMaterialEditForm();
    if (this.previewMaterial?.name?.fi || this.previewMaterial?.name?.sv || this.previewMaterial?.name?.en) {
      this.form.get('hasName').setValue(true);
    }
    this.form.get('hasMaterial').setValue(this.previewMaterial?.fileDetails?.length > 0);
    this.form.get('hasAuthor').setValue(this.previewMaterial?.authors?.length > 0);
    this.form.get('hasKeywords').setValue(this.previewMaterial?.keywords?.length > 0);
    this.form.get('hasLearningResourceTypes').setValue(this.previewMaterial?.learningResourceTypes?.length > 0);
    this.form.get('hasEducationalLevels').setValue(this.previewMaterial?.educationalLevels?.length > 0);
    this.form.get('hasLicense').setValue(this.previewMaterial?.license?.length > 0);
    if (
      this.previewMaterial?.typicalAgeRange?.typicalAgeRangeMin ||
      this.previewMaterial?.typicalAgeRange?.typicalAgeRangeMax
    ) {
      this.typicalAgeRange = `${this.previewMaterial?.typicalAgeRange?.typicalAgeRangeMin ?? ''} - ${
        this.previewMaterial?.typicalAgeRange?.typicalAgeRangeMax ?? ''
      }`;
    }
    if (this.previewMaterial.basicStudySubjects?.length > 0) {
      this.form.get('hasBasicEduObjectives').setValue(this.previewMaterial.basicStudyObjectives?.length > 0);
      this.form.get('hasBasicEduContents').setValue(this.previewMaterial.basicStudyContents?.length > 0);
      const ignoredSubjectsList = this.previewMaterial.basicStudySubjects.filter((subject: AlignmentObjectExtended) =>
        ignoredSubjects.includes(subject.key.toString()),
      );
      this.form.get('shouldHaveBasicEduObjectivesAndContents').setValue(ignoredSubjectsList.length <= 0);
    }

    if (this.shouldHaveBasicEduObjectivesAndContents === false) {
      this.form.get('hasBasicEduObjectives').setValidators(null);
      this.form.get('hasBasicEduObjectives').updateValueAndValidity();
      this.form.get('hasBasicEduContents').setValidators(null);
      this.form.get('hasBasicEduContents').updateValueAndValidity();
    }

    if (
      this.previewMaterial.upperSecondarySchoolSubjectsNew?.length > 0 &&
      this.previewMaterial.upperSecondarySchoolModulesNew?.length > 0
    ) {
      this.form.get('shouldHaveUppSecondaryEduObjectivesAndContents').setValue(true);
      this.form
        .get('hasUpperSecondaryEduObjectives')
        .setValue(this.previewMaterial.upperSecondarySchoolObjectivesNew?.length > 0);
      this.form
        .get('hasUpperSecondaryEduContents')
        .setValue(this.previewMaterial.upperSecondarySchoolContentsNew?.length > 0);
    }

    if (this.shouldHaveUppSecondaryEduObjectivesAndContents === false) {
      this.form.get('hasUpperSecondaryEduObjectives').setValidators(null);
      this.form.get('hasUpperSecondaryEduObjectives').updateValueAndValidity();
      this.form.get('hasUpperSecondaryEduContents').setValidators(null);
      this.form.get('hasUpperSecondaryEduContents').updateValueAndValidity();
    }
  }

  setTitle(): void {
    this.translate
      .get(['common.serviceName', 'titles.editMaterial.main', 'titles.editMaterial.preview'])
      .subscribe((translations: { [key: string]: string }) => {
        this.titleService.setTitle(
          `${translations['titles.editMaterial.main']}: ${translations['titles.editMaterial.preview']} - ${translations['common.serviceName']}`,
        );
      });
  }

  /**
   * Moves item in array.
   * @param {CdkDragDrop<any>} event
   */
  drop(event: CdkDragDrop<any>): void {
    moveItemInArray(this.previewMaterial.fileDetails, event.previousIndex, event.currentIndex);
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

  get hasKeywords(): boolean {
    return this.form.get('hasKeywords').value;
  }

  get hasLearningResourceTypes(): boolean {
    return this.form.get('hasLearningResourceTypes').value;
  }

  get hasEducationalLevels(): boolean {
    return this.form.get('hasEducationalLevels').value;
  }

  get shouldHaveBasicEduObjectivesAndContents(): boolean {
    return this.form.get('shouldHaveBasicEduObjectivesAndContents').value;
  }

  get hasBasicEduObjectives(): boolean {
    return this.form.get('hasBasicEduObjectives').value;
  }

  get hasBasicEduContents(): boolean {
    return this.form.get('hasBasicEduContents').value;
  }

  get shouldHaveUppSecondaryEduObjectivesAndContents(): boolean {
    return this.form.get('shouldHaveUppSecondaryEduObjectivesAndContents').value;
  }

  get hasUpperSecondaryEduObjectives(): boolean {
    return this.form.get('hasUpperSecondaryEduObjectives').value;
  }

  get hasUpperSecondaryEduContents(): boolean {
    return this.form.get('hasUpperSecondaryEduContents').value;
  }

  get hasLicense(): boolean {
    return this.form.get('hasLicense').value;
  }

  /**
   * Runs on submit. If form is valid and dirty, changed material is saved on sessionStorage.
   * If form is valid, redirects user to the next tab.
   */
  onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      this.canDeactivate = true;

      let alignmentObjects: AlignmentObjectExtended[] = [];

      // early childhood education
      this.previewMaterial.earlyChildhoodEducationSubjects.forEach((subject: AlignmentObjectExtended) => {
        subject.educationalFramework = this.previewMaterial.earlyChildhoodEducationFramework;

        alignmentObjects.push(subject);
      });
      delete this.previewMaterial.earlyChildhoodEducationSubjects;

      this.previewMaterial.earlyChildhoodEducationObjectives.forEach((objective: AlignmentObjectExtended) => {
        objective.educationalFramework = this.previewMaterial.earlyChildhoodEducationFramework;

        alignmentObjects.push(objective);
      });
      delete this.previewMaterial.earlyChildhoodEducationObjectives;
      delete this.previewMaterial.earlyChildhoodEducationFramework;

      // pre-primary education
      this.previewMaterial.prePrimaryEducationSubjects.forEach((subject: AlignmentObjectExtended) => {
        subject.educationalFramework = this.previewMaterial.prePrimaryEducationFramework;

        alignmentObjects.push(subject);
      });
      delete this.previewMaterial.prePrimaryEducationSubjects;

      this.previewMaterial.prePrimaryEducationObjectives.forEach((objective: AlignmentObjectExtended) => {
        objective.educationalFramework = this.previewMaterial.prePrimaryEducationFramework;

        alignmentObjects.push(objective);
      });
      delete this.previewMaterial.prePrimaryEducationObjectives;
      delete this.previewMaterial.prePrimaryEducationFramework;

      // basic education
      this.previewMaterial.basicStudySubjects.forEach((subject: AlignmentObjectExtended) => {
        subject.educationalFramework = this.previewMaterial.basicStudyFramework;

        alignmentObjects.push(subject);
      });
      delete this.previewMaterial.basicStudySubjects;

      this.previewMaterial.basicStudyObjectives.forEach((objective: AlignmentObjectExtended) => {
        objective.educationalFramework = this.previewMaterial.basicStudyFramework;
        delete objective.parent;

        alignmentObjects.push(objective);
      });
      delete this.previewMaterial.basicStudyObjectives;

      this.previewMaterial.basicStudyContents.forEach((content: AlignmentObjectExtended) => {
        content.educationalFramework = this.previewMaterial.basicStudyFramework;
        delete content.parent;

        alignmentObjects.push(content);
      });
      delete this.previewMaterial.basicStudyContents;
      delete this.previewMaterial.basicStudyFramework;

      // upper secondary school
      this.previewMaterial.upperSecondarySchoolSubjectsOld.forEach((subject: AlignmentObjectExtended) => {
        subject.educationalFramework = this.previewMaterial.upperSecondarySchoolFramework;

        alignmentObjects.push(subject);
      });
      delete this.previewMaterial.upperSecondarySchoolSubjectsOld;

      this.previewMaterial.upperSecondarySchoolCoursesOld.forEach((course: AlignmentObjectExtended) => {
        course.educationalFramework = this.previewMaterial.upperSecondarySchoolFramework;
        delete course.parent;

        alignmentObjects.push(course);
      });
      delete this.previewMaterial.upperSecondarySchoolCoursesOld;

      this.previewMaterial.upperSecondarySchoolObjectives.forEach((objective: AlignmentObjectExtended) => {
        objective.educationalFramework = this.previewMaterial.upperSecondarySchoolFramework;

        alignmentObjects.push(objective);
      });
      delete this.previewMaterial.upperSecondarySchoolObjectives;
      delete this.previewMaterial.upperSecondarySchoolFramework;

      //old code -->
      /*
      alignmentObjects = alignmentObjects.concat(this.previewMaterial.upperSecondarySchoolSubjectsOld);
      delete this.previewMaterial.upperSecondarySchoolSubjectsOld;
      */

      this.previewMaterial.upperSecondarySchoolSubjectsNew.forEach((subject: AlignmentObjectExtended) => {
        subject.educationalFramework = this.previewMaterial.newUpperSecondarySchoolFramework;

        alignmentObjects.push(subject);
      });
      delete this.previewMaterial.upperSecondarySchoolSubjectsNew;

      this.previewMaterial.upperSecondarySchoolModulesNew.forEach((module: AlignmentObjectExtended) => {
        delete module.parent;

        alignmentObjects.push(module);
      });
      delete this.previewMaterial.upperSecondarySchoolModulesNew;

      this.previewMaterial.upperSecondarySchoolObjectivesNew.forEach((objective: AlignmentObjectExtended) => {
        objective.educationalFramework = this.previewMaterial.newUpperSecondarySchoolFramework;
        delete objective.parent;

        alignmentObjects.push(objective);
      });
      delete this.previewMaterial.upperSecondarySchoolObjectivesNew;

      this.previewMaterial.upperSecondarySchoolContentsNew.forEach((content: AlignmentObjectExtended) => {
        content.educationalFramework = this.previewMaterial.newUpperSecondarySchoolFramework;
        delete content.parent;

        alignmentObjects.push(content);
      });
      delete this.previewMaterial.upperSecondarySchoolContentsNew;
      delete this.previewMaterial.newUpperSecondarySchoolFramework;

      //new framework old code
      /*
      alignmentObjects = alignmentObjects.concat(this.previewMaterial.upperSecondarySchoolSubjectsNew);
      delete this.previewMaterial.upperSecondarySchoolSubjectsNew;
      */

      // vocational education
      this.previewMaterial.vocationalDegrees.forEach((degree: AlignmentObjectExtended) => {
        degree.educationalFramework = this.previewMaterial.vocationalEducationFramework;

        alignmentObjects.push(degree);
      });
      delete this.previewMaterial.vocationalDegrees;

      this.previewMaterial.vocationalUnits.forEach((unit: AlignmentObjectExtended) => {
        unit.educationalFramework = this.previewMaterial.vocationalEducationFramework;
        delete unit.parent;

        alignmentObjects.push(unit);
      });
      delete this.previewMaterial.vocationalUnits;

      this.previewMaterial.vocationalCommonUnits.forEach((commonUnit: AlignmentObjectExtended) => {
        commonUnit.educationalFramework = this.previewMaterial.vocationalEducationFramework;
        delete commonUnit.parent;

        alignmentObjects.push(commonUnit);
      });
      delete this.previewMaterial.vocationalCommonUnits;

      this.previewMaterial.vocationalRequirements.forEach((requirement: AlignmentObjectExtended) => {
        requirement.educationalFramework = this.previewMaterial.vocationalEducationFramework;

        alignmentObjects.push(requirement);
      });
      delete this.previewMaterial.vocationalRequirements;

      this.previewMaterial.furtherVocationalQualifications.forEach((qualification: AlignmentObjectExtended) => {
        qualification.educationalFramework = this.previewMaterial.vocationalEducationFramework;

        alignmentObjects.push(qualification);
      });
      delete this.previewMaterial.furtherVocationalQualifications;

      this.previewMaterial.specialistVocationalQualifications.forEach((qualification: AlignmentObjectExtended) => {
        qualification.educationalFramework = this.previewMaterial.vocationalEducationFramework;

        alignmentObjects.push(qualification);
      });
      delete this.previewMaterial.specialistVocationalQualifications;
      delete this.previewMaterial.vocationalEducationFramework;

      // self-motivated competence development
      alignmentObjects = alignmentObjects.concat(this.previewMaterial.selfMotivatedEducationSubjects);
      delete this.previewMaterial.selfMotivatedEducationSubjects;

      alignmentObjects = alignmentObjects.concat(this.previewMaterial.selfMotivatedEducationObjectives);
      delete this.previewMaterial.selfMotivatedEducationObjectives;

      //preparatory education
      this.previewMaterial.preparatoryEducationSubjects.forEach((subject: AlignmentObjectExtended) => {
        alignmentObjects.push(subject);
      });
      delete this.previewMaterial.preparatoryEducationSubjects;

      this.previewMaterial.preparatoryEducationObjectives.forEach((objective: AlignmentObjectExtended) => {
        alignmentObjects.push(objective);
      });
      delete this.previewMaterial.preparatoryEducationObjectives;

      // higher education
      this.previewMaterial.branchesOfScience.forEach((branch: AlignmentObjectExtended) => {
        branch.educationalFramework = this.previewMaterial.higherEducationFramework;

        alignmentObjects.push(branch);
      });
      delete this.previewMaterial.branchesOfScience;

      this.previewMaterial.scienceBranchObjectives.forEach((objective: AlignmentObjectExtended) => {
        objective.educationalFramework = this.previewMaterial.higherEducationFramework;

        alignmentObjects.push(objective);
      });
      delete this.previewMaterial.scienceBranchObjectives;
      delete this.previewMaterial.higherEducationFramework;

      // prerequisites
      alignmentObjects = alignmentObjects.concat(this.previewMaterial.prerequisites);
      delete this.previewMaterial.prerequisites;

      // versioning
      let isVersioned = this.previewMaterial.isVersioned;

      if (!this.previewMaterial.versions.length) {
        isVersioned = true;
      }

      // materials
      const materials: Material[] = [];

      // attachmentDetails
      const attachmentDetails: AttachmentDetail[] = [];

      // fileDetails
      const fileDetails = this.previewMaterial.fileDetails.map((file, idx: number) => {
        const subtitles: string[] = [];

        file.subtitles.forEach((subtitle) => {
          attachmentDetails.push({
            id: subtitle.id,
            kind: subtitle.kind,
            default: subtitle.default,
            lang: subtitle.srclang,
            label: subtitle.label,
          });

          subtitles.push(subtitle.id);
        });

        materials.push({
          materialId: file.id,
          priority: idx,
          attachments: subtitles,
        });

        delete file.file;
        delete file.priority;
        delete file.subtitles;

        return file;
      });
      delete this.previewMaterial.fileDetails;
      delete this.previewMaterial.videoFiles;

      // thumbnail
      delete this.previewMaterial.thumbnail;

      // references
      const isBasedOn = {
        externals: this.previewMaterial.externals,
      };
      delete this.previewMaterial.externals;

      const updatedMaterial: EducationalMaterialPut = Object.assign(
        {},
        this.previewMaterial,
        { isVersioned },
        { materials },
        { fileDetails },
        { attachmentDetails },
        { alignmentObjects },
        { isBasedOn },
      );

      this.materialService
        .updateEducationalMaterialMetadata(this.materialService.getEducationalMaterialID(), updatedMaterial)
        .subscribe({
          error: (err) => console.error(err),
          complete: () => {
            this.router.navigate(['/materiaali', this.materialService.getEducationalMaterialID()]).then(() => {
              this.materialService.clearEducationalMaterialEditForm();
              this.materialService.clearEducationalMaterialID();
              this.materialService.clearUploadedFiles();
              this.materialService.clearUploadResponses();
            });
          },
        });
    } else {
      void this.router.navigate(['/materiaali', this.materialService.getEducationalMaterialID()]);
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
    void this.router.navigate([
      '/muokkaa-oppimateriaalia',
      this.materialService.getEducationalMaterialID(),
      this.tabId - 1,
    ]);
  }
}
