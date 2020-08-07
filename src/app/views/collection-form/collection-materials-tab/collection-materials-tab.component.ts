import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CollectionForm, CollectionFormMaterial, CollectionFormMaterialAndHeading } from '@models/collections/collection-form';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { validatorParams } from '../../../constants/validator-params';
import { descriptionValidator, textInputValidator } from '../../../shared/shared.module';

@Component({
  selector: 'app-collection-materials-tab',
  templateUrl: './collection-materials-tab.component.html',
  styleUrls: ['./collection-materials-tab.component.scss']
})
export class CollectionMaterialsTabComponent implements OnInit, OnDestroy {
  @Input() collection: CollectionForm;
  @Input() collectionId: string;
  @Input() tabId: number;
  @Output() abort = new EventEmitter();
  form: FormGroup;
  lang = this.translate.currentLang;
  submitted = false;
  materials = new Map();

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private router: Router,
    private titleSvc: Title,
  ) { }

  ngOnInit(): void {
    this.setTitle();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.setTitle();
    });

    this.form = this.fb.group({
      materialsAndHeadings: this.fb.array([]),
    });

    if (sessionStorage.getItem(environment.collection) === null) {
      this.patchMaterialsAndHeadings(this.collection.materialsAndHeadings);
      this.mapMaterials(this.collection.materials);
    } else {
      const changedCollection = JSON.parse(sessionStorage.getItem(environment.collection)).materialsAndHeadings;

      this.patchMaterialsAndHeadings(changedCollection.materialsAndHeadings);
      this.mapMaterials(changedCollection.materials);
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
      this.titleSvc.setTitle(`${translations.main}: ${translations.materials} ${environment.title}`);
    });
  }

  /** @getters */
  get materialsAndHeadingsArray(): FormArray {
    return this.form.get('materialsAndHeadings') as FormArray;
  }

  /**
   * Patches materials and headings array.
   * @param {CollectionFormMaterialAndHeading[]} materialsAndHeadings
   */
  patchMaterialsAndHeadings(materialsAndHeadings: CollectionFormMaterialAndHeading[]): void {
    materialsAndHeadings.forEach((materialOrHeading: CollectionFormMaterialAndHeading) => {
      if (materialOrHeading.id) {
        this.materialsAndHeadingsArray.push(this.createMaterial(materialOrHeading));
      } else {
        this.materialsAndHeadingsArray.push(this.createHeading(materialOrHeading));
      }
    });
  }

  /**
   * Creates material FormGroup.
   * @param {CollectionFormMaterialAndHeading} material
   * @returns {FormGroup}
   */
  createMaterial(material: CollectionFormMaterialAndHeading): FormGroup {
    return this.fb.group({
      id: this.fb.control(material.id),
      priority: this.fb.control(material.priority),
    });
  }

  /**
   * Creates heading FormGroup. Fills controls if heading given as param.
   * @param {CollectionFormMaterialAndHeading|null} heading
   * @returns {FormGroup}
   */
  createHeading(heading?: CollectionFormMaterialAndHeading): FormGroup {
    return this.fb.group({
      heading: this.fb.control(heading ? heading.heading : null, [
        Validators.maxLength(validatorParams.name.maxLength),
        textInputValidator(),
      ]),
      description: this.fb.control(heading ? heading.description : null, [
        Validators.maxLength(validatorParams.description.maxLength),
        descriptionValidator(),
      ]),
      priority: this.fb.control(heading ? heading.priority : null),
    });
  }

  /**
   * Adds new heading FormGroup
   * @param {number} idx
   */
  addHeading(idx: number): void {
    this.materialsAndHeadingsArray.insert(idx, this.createHeading());
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
   */
  onSubmit(): void {
    this.submitted = true;

    console.log(this.materialsAndHeadingsArray.value);

    if (this.form.valid) {
      this.saveCollection();

      this.router.navigate(['/kokoelma', this.collectionId, 'muokkaa', this.tabId + 1]);
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
