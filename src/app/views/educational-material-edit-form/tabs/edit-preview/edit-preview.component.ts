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
  previewMaterial: EducationalMaterialForm;
  @Output() abortEdit = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private backendSvc: BackendService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      confirm: this.fb.control(false, [ Validators.requiredTrue ]),
    });

    this.lang = this.translate.currentLang;

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    if (sessionStorage.getItem(environment.editMaterial) === null) {
      this.previewMaterial = this.material;
    } else {
      this.previewMaterial = JSON.parse(sessionStorage.getItem(environment.editMaterial));
    }
  }

  /**
   * Moves item in array.
   * @param {CdkDragDrop<any>} event
   */
  drop(event: CdkDragDrop<any>) {
    moveItemInArray(this.previewMaterial.fileDetails, event.previousIndex, event.currentIndex);
  }

  /**
   * Runs on submit. If form is valid and dirty, changed material is saved on sessionStorage.
   * If form is valid, redirects user to the next tab.
   */
  onSubmit(): void {
    this.submitted = true;

    // const changedMaterial: EducationalMaterialForm = JSON.parse(sessionStorage.getItem(environment.editMaterial));

    if (this.form.valid) {
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
      this.previewMaterial.upperSecondarySchoolSubjects.forEach((subject: AlignmentObjectExtended) => {
        subject.educationalFramework = this.previewMaterial.upperSecondarySchoolFramework;

        alignmentObjects.push(subject);
      });
      delete this.previewMaterial.upperSecondarySchoolSubjects;

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

      this.previewMaterial.vocationalEducationObjectives.forEach((objective: AlignmentObjectExtended) => {
        objective.educationalFramework = this.previewMaterial.vocationalEducationFramework;

        alignmentObjects.push(objective);
      });
      delete this.previewMaterial.vocationalEducationObjectives;
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
      const isVersioned = false;

      // materials
      const materials: Material[] = [];

      // attachmentDetails
      const attachmentDetails: AttachmentDetail[] = [];

      // fileDetails
      const fileDetails = this.previewMaterial.fileDetails.map((file, idx: number) => {
        materials.push({
          materialId: file.id,
          priority: idx,
        });

        file.subtitles.forEach((subtitle) => {
          attachmentDetails.push({
            id: subtitle.id,
            kind: subtitle.kind,
            default: subtitle.default,
            lang: subtitle.srclang,
            label: subtitle.label,
          });
        });

        delete file.file;
        delete file.priority;
        delete file.subtitles;

        return file;
      });
      delete this.previewMaterial.fileDetails;

      // thumbnail
      delete this.previewMaterial.thumbnail;

      const updatedMaterial: EducationalMaterialPut = Object.assign(
        {},
        this.previewMaterial,
        { isVersioned },
        { materials },
        { fileDetails },
        { attachmentDetails },
        { alignmentObjects },
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
