import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CollectionForm, CollectionFormMaterial } from '@models/collections/collection-form';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { UpdateCollectionPut, UpdateCollectionPutHeading, UpdateCollectionPutMaterial } from '@models/collections/update-collection-put';
import { CollectionService } from '@services/collection.service';
import { AlignmentObjectExtended } from '@models/alignment-object-extended';

@Component({
  selector: 'app-collection-preview-tab',
  templateUrl: './collection-preview-tab.component.html',
  styleUrls: ['./collection-preview-tab.component.scss']
})
export class CollectionPreviewTabComponent implements OnInit {
  @Input() collection: CollectionForm;
  @Input() collectionId: string;
  @Input() tabId: number;
  @Output() abort = new EventEmitter();
  form: FormGroup;
  lang = this.translate.currentLang;
  submitted = false;
  previewCollection: CollectionForm;
  materials: Map<string, CollectionFormMaterial> = new Map<string, CollectionFormMaterial>();

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private router: Router,
    private titleSvc: Title,
    private collectionSvc: CollectionService,
  ) { }

  ngOnInit(): void {
    this.setTitle();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.setTitle();
    });

    this.form = this.fb.group({
      hasName: this.fb.control(false, [
        Validators.requiredTrue,
      ]),
      hasKeywords: this.fb.control(false, [
        Validators.requiredTrue,
      ]),
      hasDescription: this.fb.control(false, [
        Validators.requiredTrue,
      ]),
    });

    if (sessionStorage.getItem(environment.collection) === null) {
      this.previewCollection = this.collection;
    } else {
      this.previewCollection = JSON.parse(sessionStorage.getItem(environment.collection));
    }

    this.mapMaterials(this.previewCollection.materials);

    if (this.previewCollection.name) {
      this.form.get('hasName').setValue(true);
    }

    if (this.previewCollection.keywords && this.previewCollection.keywords.length > 0) {
      this.form.get('hasKeywords').setValue(true);
    }

    if (this.previewCollection.description) {
      this.form.get('hasDescription').setValue(true);
    }
  }

  /**
   * Updates page title.
   */
  setTitle(): void {
    this.translate.get('titles.collection').subscribe((translations: any) => {
      this.titleSvc.setTitle(`${translations.main}: ${translations.preview} ${environment.title}`);
    });
  }

  get hasName(): boolean {
    return this.form.get('hasName').value;
  }

  get hasKeywords(): boolean {
    return this.form.get('hasKeywords').value;
  }

  get hasDescription(): boolean {
    return this.form.get('hasDescription').value;
  }

  /**
   * Maps collection materials to materials Map.
   * @param {CollectionFormMaterial[]} materials
   */
  mapMaterials(materials: CollectionFormMaterial[]): void {
    materials.forEach((material: CollectionFormMaterial) => {
      this.materials.set(material.id, material);
    });
  }

  /**
   * Runs on submit. Redirects user to the next tab if form is valid.
   * @param privateCollection {boolean} Save as private collection?
   */
  onSubmit(privateCollection?: boolean): void {
    this.submitted = true;
    const publish = !privateCollection;

    if (this.form.valid) {
      let alignmentObjects: AlignmentObjectExtended[] = [];

      // early childhood education
      this.previewCollection.earlyChildhoodEducationSubjects.forEach((subject: AlignmentObjectExtended) => {
        alignmentObjects.push({
          ...subject,
          educationalFramework: this.previewCollection.earlyChildhoodEducationFramework,
        });
      });

      this.previewCollection.earlyChildhoodEducationObjectives.forEach((objective: AlignmentObjectExtended) => {
        alignmentObjects.push({
          ...objective,
          educationalFramework: this.previewCollection.earlyChildhoodEducationFramework,
        });
      });

      delete this.previewCollection.earlyChildhoodEducationSubjects;
      delete this.previewCollection.earlyChildhoodEducationObjectives;
      delete this.previewCollection.earlyChildhoodEducationFramework;

      // pre-primary education
      this.previewCollection.prePrimaryEducationSubjects.forEach((subject: AlignmentObjectExtended) => {
        alignmentObjects.push({
          ...subject,
          educationalFramework: this.previewCollection.prePrimaryEducationFramework,
        });
      });

      this.previewCollection.prePrimaryEducationObjectives.forEach((objective: AlignmentObjectExtended) => {
        alignmentObjects.push({
          ...objective,
          educationalFramework: this.previewCollection.prePrimaryEducationFramework,
        });
      });

      delete this.previewCollection.prePrimaryEducationSubjects;
      delete this.previewCollection.prePrimaryEducationObjectives;
      delete this.previewCollection.prePrimaryEducationFramework;

      // basic education
      this.previewCollection.basicStudySubjects.forEach((subject: AlignmentObjectExtended) => {
        alignmentObjects.push({
          ...subject,
          educationalFramework: this.previewCollection.basicStudyFramework,
        });
      });

      this.previewCollection.basicStudyObjectives.forEach((objective: AlignmentObjectExtended) => {
        delete objective.parent;

        alignmentObjects.push({
          ...objective,
          educationalFramework: this.previewCollection.basicStudyFramework,
        });
      });

      this.previewCollection.basicStudyContents.forEach((content: AlignmentObjectExtended) => {
        delete content.parent;

        alignmentObjects.push({
          ...content,
          educationalFramework: this.previewCollection.basicStudyFramework,
        });
      });

      delete this.previewCollection.basicStudySubjects;
      delete this.previewCollection.basicStudyObjectives;
      delete this.previewCollection.basicStudyContents;
      delete this.previewCollection.basicStudyFramework;

      // upper secondary school
      this.previewCollection.upperSecondarySchoolSubjects.forEach((subject: AlignmentObjectExtended) => {
        alignmentObjects.push({
          ...subject,
          educationalFramework: this.previewCollection.upperSecondarySchoolFramework,
        });
      });

      this.previewCollection.upperSecondarySchoolObjectives.forEach((objective: AlignmentObjectExtended) => {
        alignmentObjects.push({
          ...objective,
          educationalFramework: this.previewCollection.upperSecondarySchoolFramework,
        });
      });

      delete this.previewCollection.currentUpperSecondarySchoolSelected;
      delete this.previewCollection.upperSecondarySchoolSubjects;
      delete this.previewCollection.upperSecondarySchoolObjectives;
      delete this.previewCollection.upperSecondarySchoolFramework;

      alignmentObjects = alignmentObjects.concat(this.previewCollection.upperSecondarySchoolSubjectsNew);

      this.previewCollection.upperSecondarySchoolModulesNew.forEach((module: AlignmentObjectExtended) => {
        delete module.parent;

        alignmentObjects.push(module);
      });

      this.previewCollection.upperSecondarySchoolObjectivesNew.forEach((objective: AlignmentObjectExtended) => {
        delete objective.parent;

        alignmentObjects.push(objective);
      });

      this.previewCollection.upperSecondarySchoolContentsNew.forEach((content: AlignmentObjectExtended) => {
        delete content.parent;

        alignmentObjects.push(content);
      });

      delete this.previewCollection.newUpperSecondarySchoolSelected;
      delete this.previewCollection.upperSecondarySchoolSubjectsNew;
      delete this.previewCollection.upperSecondarySchoolModulesNew;
      delete this.previewCollection.upperSecondarySchoolObjectivesNew;
      delete this.previewCollection.upperSecondarySchoolContentsNew;

      // vocational education
      this.previewCollection.vocationalDegrees.forEach((degree: AlignmentObjectExtended) => {
        alignmentObjects.push({
          ...degree,
          educationalFramework: this.previewCollection.vocationalEducationFramework,
        });
      });

      this.previewCollection.vocationalUnits.forEach((unit: AlignmentObjectExtended) => {
        alignmentObjects.push({
          ...unit,
          educationalFramework: this.previewCollection.vocationalEducationFramework,
        });
      });

      this.previewCollection.vocationalRequirements.forEach((requirement: AlignmentObjectExtended) => {
        alignmentObjects.push({
          ...requirement,
          educationalFramework: this.previewCollection.vocationalEducationFramework,
        });
      });

      delete this.previewCollection.vocationalDegrees;
      delete this.previewCollection.vocationalUnits;
      delete this.previewCollection.vocationalRequirements;
      delete this.previewCollection.vocationalEducationFramework;

      // self-motivated competence development
      alignmentObjects = alignmentObjects.concat(this.previewCollection.selfMotivatedEducationSubjects);

      alignmentObjects = alignmentObjects.concat(this.previewCollection.selfMotivatedEducationObjectives);

      delete this.previewCollection.selfMotivatedEducationSubjects;
      delete this.previewCollection.selfMotivatedEducationObjectives;

      // higher education
      this.previewCollection.scienceBranches.forEach((branch: AlignmentObjectExtended) => {
        alignmentObjects.push({
          ...branch,
          educationalFramework: this.previewCollection.higherEducationFramework,
        });
      });

      this.previewCollection.scienceBranchObjectives.forEach((objective: AlignmentObjectExtended) => {
        alignmentObjects.push({
          ...objective,
          educationalFramework: this.previewCollection.higherEducationFramework,
        });
      });

      delete this.previewCollection.scienceBranches;
      delete this.previewCollection.scienceBranchObjectives;
      delete this.previewCollection.higherEducationFramework;

      delete this.previewCollection.id;
      delete this.previewCollection.thumbnail;

      const materials: UpdateCollectionPutMaterial[] = [];
      const headings: UpdateCollectionPutHeading[] = [];

      this.previewCollection.materialsAndHeadings.forEach((materialOrHeading: any) => {
        if (materialOrHeading.hasOwnProperty('heading')) {
          headings.push(materialOrHeading);
        } else {
          materials.push(materialOrHeading);
        }
      });

      delete this.previewCollection.materials;
      delete this.previewCollection.materialsAndHeadings;

      const updatedCollection: UpdateCollectionPut = Object.assign(
        {},
        { collectionId: this.collectionId },
        { publish },
        { alignmentObjects },
        { materials },
        { headings },
        this.previewCollection,
      );

      this.collectionSvc.updateCollectionDetails(updatedCollection).subscribe(
        () => this.router.navigate(['/kokoelma', this.collectionId]),
      );
    }
  }

  /**
   * Emits EventEmitter indicating user wants to abort.
   */
  emitAbort(): void {
    this.abort.emit();
  }

  /**
   * Redirects user to previous tab.
   */
  previous(): void {
    this.router.navigate(['/kokoelma', this.collectionId, 'muokkaa', this.tabId - 1]);
  }
}
