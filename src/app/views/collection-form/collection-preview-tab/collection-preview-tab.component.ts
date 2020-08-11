import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CollectionForm, CollectionFormMaterial } from '@models/collections/collection-form';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { UpdateCollectionPut } from '@models/collections/update-collection-put';
import { CollectionService } from '@services/collection.service';
import { AlignmentObjectExtended } from '@models/alignment-object-extended';

@Component({
  selector: 'app-collection-preview-tab',
  templateUrl: './collection-preview-tab.component.html',
  styleUrls: ['./collection-preview-tab.component.scss']
})
export class CollectionPreviewTabComponent implements OnInit, OnDestroy {
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

  ngOnDestroy(): void {
    if (this.submitted === false && this.form.dirty && this.form.valid) {
      this.saveCollection();
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
      alignmentObjects = alignmentObjects.concat(this.previewCollection.earlyChildhoodEducationSubjects);
      delete this.previewCollection.earlyChildhoodEducationSubjects;

      alignmentObjects = alignmentObjects.concat(this.previewCollection.earlyChildhoodEducationObjectives);
      delete this.previewCollection.earlyChildhoodEducationObjectives;

      // pre-primary education
      alignmentObjects = alignmentObjects.concat(this.previewCollection.prePrimaryEducationSubjects);
      delete this.previewCollection.prePrimaryEducationSubjects;

      alignmentObjects = alignmentObjects.concat(this.previewCollection.prePrimaryEducationObjectives);
      delete this.previewCollection.prePrimaryEducationObjectives;

      // basic education
      alignmentObjects = alignmentObjects.concat(this.previewCollection.basicStudySubjects);
      delete this.previewCollection.basicStudySubjects;

      this.previewCollection.basicStudyObjectives.forEach((objective: AlignmentObjectExtended) => {
        delete objective.parent;

        alignmentObjects.push(objective);
      });
      delete this.previewCollection.basicStudyObjectives;

      this.previewCollection.basicStudyContents.forEach((content: AlignmentObjectExtended) => {
        delete content.parent;

        alignmentObjects.push(content);
      });
      delete this.previewCollection.basicStudyContents;

      // upper secondary school
      alignmentObjects = alignmentObjects.concat(this.previewCollection.upperSecondarySchoolSubjects);
      delete this.previewCollection.upperSecondarySchoolSubjects;

      alignmentObjects = alignmentObjects.concat(this.previewCollection.upperSecondarySchoolObjectives);
      delete this.previewCollection.upperSecondarySchoolObjectives;

      alignmentObjects = alignmentObjects.concat(this.previewCollection.upperSecondarySchoolSubjectsNew);
      delete this.previewCollection.upperSecondarySchoolSubjectsNew;

      this.previewCollection.upperSecondarySchoolModulesNew.forEach((module: AlignmentObjectExtended) => {
        delete module.parent;

        alignmentObjects.push(module);
      });
      delete this.previewCollection.upperSecondarySchoolModulesNew;

      this.previewCollection.upperSecondarySchoolObjectivesNew.forEach((objective: AlignmentObjectExtended) => {
        delete objective.parent;

        alignmentObjects.push(objective);
      });
      delete this.previewCollection.upperSecondarySchoolObjectivesNew;

      this.previewCollection.upperSecondarySchoolContentsNew.forEach((content: AlignmentObjectExtended) => {
        delete content.parent;

        alignmentObjects.push(content);
      });
      delete this.previewCollection.upperSecondarySchoolContentsNew;

      // vocational education
      alignmentObjects = alignmentObjects.concat(this.previewCollection.vocationalDegrees);
      delete this.previewCollection.vocationalDegrees;

      alignmentObjects = alignmentObjects.concat(this.previewCollection.vocationalUnits);
      delete this.previewCollection.vocationalUnits;

      alignmentObjects = alignmentObjects.concat(this.previewCollection.vocationalEducationObjectives);
      delete this.previewCollection.vocationalEducationObjectives;

      // self-motivated competence development
      alignmentObjects = alignmentObjects.concat(this.previewCollection.selfMotivatedEducationSubjects);
      delete this.previewCollection.selfMotivatedEducationSubjects;

      alignmentObjects = alignmentObjects.concat(this.previewCollection.selfMotivatedEducationObjectives);
      delete this.previewCollection.selfMotivatedEducationObjectives;

      // higher education
      alignmentObjects = alignmentObjects.concat(this.previewCollection.scienceBranches);
      delete this.previewCollection.scienceBranches;

      alignmentObjects = alignmentObjects.concat(this.previewCollection.scienceBranchObjectives);
      delete this.previewCollection.scienceBranchObjectives;

      // @todo: REMOVE BEFORE PRODUCTION
      alignmentObjects = alignmentObjects.map((aObject: AlignmentObjectExtended) => {
        return {
          ...aObject,
          educationalFramework: '',
        };
      });

      delete this.previewCollection.id;

      // @todo: materials and headings

      const updatedCollection: UpdateCollectionPut = Object.assign(
        {},
        { collectionId: this.collectionId },
        { publish },
        { alignmentObjects },
        this.previewCollection,
      );

      this.collectionSvc.updateCollectionDetails(updatedCollection).subscribe(
        () => this.router.navigate(['/kokoelma', this.collectionId]),
      );
    }
  }

  /**
   * Saves collection to session storage.
   */
  saveCollection(): void {
    const changedCollection: CollectionForm = sessionStorage.getItem(environment.collection) !== null
      ? JSON.parse(sessionStorage.getItem(environment.collection))
      : this.collection;

    // @todo: add changed values

    sessionStorage.setItem(environment.collection, JSON.stringify(changedCollection));
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
