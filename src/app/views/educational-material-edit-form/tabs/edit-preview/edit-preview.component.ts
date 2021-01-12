import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EducationalMaterialForm } from '@models/educational-material-form';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { environment } from '../../../../../environments/environment';
import { AlignmentObjectExtended } from '@models/alignment-object-extended';
import { BackendService } from '@services/backend.service';
import { AttachmentDetail, EducationalMaterialPut, Material } from '@models/educational-material-put';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-tabs-edit-preview',
  templateUrl: './edit-preview.component.html',
  styleUrls: ['./edit-preview.component.scss']
})
export class EditPreviewComponent implements OnInit {
  @Input() material: EducationalMaterialForm;
  @Input() materialId: number;
  @Input() tabId: number;
  form: FormGroup;
  lang: string;
  submitted = false;
  canDeactivate = false;
  previewMaterial: EducationalMaterialForm;
  @Output() abortEdit = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private backendSvc: BackendService,
    private router: Router,
    private titleSvc: Title,
  ) { }

  ngOnInit(): void {
    this.setTitle();

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
      hasKeywords: this.fb.control(false, [
        Validators.requiredTrue,
      ]),
      hasLearningResourceTypes: this.fb.control(false, [
        Validators.requiredTrue,
      ]),
      hasEducationalLevels: this.fb.control(false, [
        Validators.requiredTrue,
      ]),
      hasLicense: this.fb.control(false, [
        Validators.requiredTrue,
      ]),
      confirm: this.fb.control(false, [
        Validators.requiredTrue,
      ]),
    });

    this.lang = this.translate.currentLang;

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.setTitle();
    });

    if (sessionStorage.getItem(environment.editMaterial) === null) {
      this.previewMaterial = this.material;
    } else {
      this.previewMaterial = JSON.parse(sessionStorage.getItem(environment.editMaterial));
    }

    if (this.previewMaterial.name) {
      if (this.previewMaterial.name.fi || this.previewMaterial.name.sv || this.previewMaterial.name.en) {
        this.form.get('hasName').setValue(true);
      }
    }

    if (this.previewMaterial.fileDetails) {
      if (this.previewMaterial.fileDetails.length > 0) {
        this.form.get('hasMaterial').setValue(true);
      }
    }

    if (this.previewMaterial.authors) {
      if (this.previewMaterial.authors.length > 0) {
        this.form.get('hasAuthor').setValue(true);
      }
    }

    if (this.previewMaterial.keywords) {
      if (this.previewMaterial.keywords.length > 0) {
        this.form.get('hasKeywords').setValue(true);
      }
    }

    if (this.previewMaterial.learningResourceTypes) {
      if (this.previewMaterial.learningResourceTypes.length > 0) {
        this.form.get('hasLearningResourceTypes').setValue(true);
      }
    }

    if (this.previewMaterial.educationalLevels) {
      if (this.previewMaterial.educationalLevels.length > 0) {
        this.form.get('hasEducationalLevels').setValue(true);
      }
    }

    if (this.previewMaterial.license) {
      this.form.get('hasLicense').setValue(true);
    }
  }

  setTitle(): void {
    this.translate.get('titles.editMaterial').subscribe((translations: any) => {
      this.titleSvc.setTitle(`${translations.main}: ${translations.preview} ${environment.title}`);
    });
  }

  /**
   * Moves item in array.
   * @param {CdkDragDrop<any>} event
   */
  drop(event: CdkDragDrop<any>) {
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
      alignmentObjects = alignmentObjects.concat(this.previewMaterial.upperSecondarySchoolSubjectsOld);
      delete this.previewMaterial.upperSecondarySchoolSubjectsOld;

      this.previewMaterial.upperSecondarySchoolCoursesOld.forEach((course: AlignmentObjectExtended) => {
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

      alignmentObjects = alignmentObjects.concat(this.previewMaterial.upperSecondarySchoolSubjectsNew);
      delete this.previewMaterial.upperSecondarySchoolSubjectsNew;

      this.previewMaterial.upperSecondarySchoolModulesNew.forEach((module: AlignmentObjectExtended) => {
        delete module.parent;

        alignmentObjects.push(module);
      });
      delete this.previewMaterial.upperSecondarySchoolModulesNew;

      this.previewMaterial.upperSecondarySchoolObjectivesNew.forEach((objective: AlignmentObjectExtended) => {
        delete objective.parent;

        alignmentObjects.push(objective);
      });
      delete this.previewMaterial.upperSecondarySchoolObjectivesNew;

      this.previewMaterial.upperSecondarySchoolContentsNew.forEach((content: AlignmentObjectExtended) => {
        delete content.parent;

        alignmentObjects.push(content);
      });
      delete this.previewMaterial.upperSecondarySchoolContentsNew;

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
        const subtitles: number[] = [];

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

      this.backendSvc.postMeta(this.materialId, updatedMaterial).subscribe(
        () => this.router.navigate(['/materiaali', this.materialId]),
        (err) => console.error(err),
      );
    } else {
      this.router.navigate(['/materiaali', this.materialId]);
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
