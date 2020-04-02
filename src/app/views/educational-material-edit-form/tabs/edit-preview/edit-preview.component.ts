import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EducationalMaterialForm } from '@models/educational-material-form';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { environment } from '../../../../../environments/environment';
import { AlignmentObjectExtended } from '@models/alignment-object-extended';
import { BackendService } from '@services/backend.service';

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

    const changedMaterial: EducationalMaterialForm = JSON.parse(sessionStorage.getItem(environment.editMaterial));

    if (this.form.valid && changedMaterial) {
      let alignmentObjects: AlignmentObjectExtended[] = [];
      const fileOrder = [];

      // early childhood education
      changedMaterial.earlyChildhoodEducationSubjects.forEach((subject: AlignmentObjectExtended) => {
        subject.educationalFramework = changedMaterial.earlyChildhoodEducationFramework;

        alignmentObjects.push(subject);
      });
      delete changedMaterial.earlyChildhoodEducationSubjects;

      changedMaterial.earlyChildhoodEducationObjectives.forEach((objective: AlignmentObjectExtended) => {
        objective.educationalFramework = changedMaterial.earlyChildhoodEducationFramework;

        alignmentObjects.push(objective);
      });
      delete changedMaterial.earlyChildhoodEducationObjectives;
      delete changedMaterial.earlyChildhoodEducationFramework;

      // pre-primary education
      changedMaterial.prePrimaryEducationSubjects.forEach((subject: AlignmentObjectExtended) => {
        subject.educationalFramework = changedMaterial.prePrimaryEducationFramework;

        alignmentObjects.push(subject);
      });
      delete changedMaterial.prePrimaryEducationSubjects;

      changedMaterial.prePrimaryEducationObjectives.forEach((objective: AlignmentObjectExtended) => {
        objective.educationalFramework = changedMaterial.prePrimaryEducationFramework;

        alignmentObjects.push(objective);
      });
      delete changedMaterial.prePrimaryEducationObjectives;
      delete changedMaterial.prePrimaryEducationFramework;

      // basic education
      changedMaterial.basicStudySubjects.forEach((subject: AlignmentObjectExtended) => {
        subject.educationalFramework = changedMaterial.basicStudyFramework;

        alignmentObjects.push(subject);
      });
      delete changedMaterial.basicStudySubjects;

      changedMaterial.basicStudyObjectives.forEach((objective: AlignmentObjectExtended) => {
        objective.educationalFramework = changedMaterial.basicStudyFramework;
        delete objective.parent;

        alignmentObjects.push(objective);
      });
      delete changedMaterial.basicStudyObjectives;

      changedMaterial.basicStudyContents.forEach((content: AlignmentObjectExtended) => {
        content.educationalFramework = changedMaterial.basicStudyFramework;
        delete content.parent;

        alignmentObjects.push(content);
      });
      delete changedMaterial.basicStudyContents;
      delete changedMaterial.basicStudyFramework;

      // upper secondary school
      changedMaterial.upperSecondarySchoolSubjects.forEach((subject: AlignmentObjectExtended) => {
        subject.educationalFramework = changedMaterial.upperSecondarySchoolFramework;

        alignmentObjects.push(subject);
      });
      delete changedMaterial.upperSecondarySchoolSubjects;

      changedMaterial.upperSecondarySchoolObjectives.forEach((objective: AlignmentObjectExtended) => {
        objective.educationalFramework = changedMaterial.upperSecondarySchoolFramework;

        alignmentObjects.push(objective);
      });
      delete changedMaterial.upperSecondarySchoolObjectives;
      delete changedMaterial.upperSecondarySchoolFramework;

      alignmentObjects = alignmentObjects.concat(changedMaterial.upperSecondarySchoolSubjectsNew);
      delete changedMaterial.upperSecondarySchoolSubjectsNew;

      changedMaterial.upperSecondarySchoolModulesNew.forEach((module: AlignmentObjectExtended) => {
        delete module.parent;

        alignmentObjects.push(module);
      });
      delete changedMaterial.upperSecondarySchoolModulesNew;

      changedMaterial.upperSecondarySchoolObjectivesNew.forEach((objective: AlignmentObjectExtended) => {
        delete objective.parent;

        alignmentObjects.push(objective);
      });
      delete changedMaterial.upperSecondarySchoolObjectivesNew;

      changedMaterial.upperSecondarySchoolContentsNew.forEach((content: AlignmentObjectExtended) => {
        delete content.parent;

        alignmentObjects.push(content);
      });
      delete changedMaterial.upperSecondarySchoolContentsNew;

      // vocational education
      changedMaterial.vocationalDegrees.forEach((degree: AlignmentObjectExtended) => {
        degree.educationalFramework = changedMaterial.vocationalEducationFramework;

        alignmentObjects.push(degree);
      });
      delete changedMaterial.vocationalDegrees;

      changedMaterial.vocationalUnits.forEach((unit: AlignmentObjectExtended) => {
        unit.educationalFramework = changedMaterial.vocationalEducationFramework;
        delete unit.parent;

        alignmentObjects.push(unit);
      });
      delete changedMaterial.vocationalUnits;

      changedMaterial.vocationalEducationObjectives.forEach((objective: AlignmentObjectExtended) => {
        objective.educationalFramework = changedMaterial.vocationalEducationFramework;

        alignmentObjects.push(objective);
      });
      delete changedMaterial.vocationalEducationObjectives;
      delete changedMaterial.vocationalEducationFramework;

      // self-motivated competence development
      alignmentObjects = alignmentObjects.concat(changedMaterial.selfMotivatedEducationSubjects);
      delete changedMaterial.selfMotivatedEducationSubjects;

      alignmentObjects = alignmentObjects.concat(changedMaterial.selfMotivatedEducationObjectives);
      delete changedMaterial.selfMotivatedEducationObjectives;

      // higher education
      changedMaterial.branchesOfScience.forEach((branch: AlignmentObjectExtended) => {
        branch.educationalFramework = changedMaterial.higherEducationFramework;

        alignmentObjects.push(branch);
      });
      delete changedMaterial.branchesOfScience;

      changedMaterial.scienceBranchObjectives.forEach((objective: AlignmentObjectExtended) => {
        objective.educationalFramework = changedMaterial.higherEducationFramework;

        alignmentObjects.push(objective);
      });
      delete changedMaterial.scienceBranchObjectives;
      delete changedMaterial.higherEducationFramework;

      // prerequisites
      alignmentObjects = alignmentObjects.concat(changedMaterial.prerequisites);
      delete changedMaterial.prerequisites;

      // fileDetails
      const fileDetails = changedMaterial.fileDetails.map((file, idx: number) => {
        fileOrder.push({
          id: file.id,
          priority: idx,
        });

        delete file.file;
        delete file.priority;

        return file;
      });
      delete changedMaterial.fileDetails;

      // thumbnail
      delete changedMaterial.thumbnail;

      const updatedMaterial = Object.assign(
        {},
        changedMaterial,
        { fileOrder },
        { fileDetails },
        { alignmentObjects }
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
