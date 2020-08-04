import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EducationalMaterialForm } from '@models/educational-material-form';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { Title } from '@angular/platform-browser';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { textInputValidator } from '../../../../shared/shared.module';
import { validatorParams } from '../../../../constants/validator-params';

@Component({
  selector: 'app-tabs-edit-based-on-details',
  templateUrl: './edit-based-on-details.component.html',
  styleUrls: ['./edit-based-on-details.component.scss']
})
export class EditBasedOnDetailsComponent implements OnInit, OnDestroy {
  @Input() material: EducationalMaterialForm;
  @Input() materialId: number;
  @Input() tabId: number;
  form: FormGroup;
  submitted = false;
  @Output() abortEdit = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private translate: TranslateService,
    private titleSvc: Title,
  ) { }

  ngOnInit(): void {
    this.setTitle();

    this.form = this.fb.group({
      externals: this.fb.array([]),
    });

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setTitle();
    });

    if (sessionStorage.getItem(environment.editMaterial) === null) {
      this.form.patchValue(this.material);

      this.patchExternals(this.material.externals);
    } else {
      const editMaterial: EducationalMaterialForm = JSON.parse(sessionStorage.getItem(environment.editMaterial));

      this.form.patchValue(editMaterial);

      this.patchExternals(editMaterial.externals);
    }
  }

  ngOnDestroy(): void {
    if (this.submitted === false && this.form.dirty && this.form.valid) {
      this.saveData();
    }
  }

  setTitle(): void {
    this.translate.get('titles.editMaterial').subscribe((translations: any) => {
      this.titleSvc.setTitle(`${translations.main}: ${translations.references} ${environment.title}`);
    });
  }

  get externalsArray(): FormArray {
    return this.form.get('externals') as FormArray;
  }

  /**
   * Patches external refenreces array.
   * @param externals
   */
  patchExternals(externals): void {
    externals.forEach((external) => this.externalsArray.push(this.createExternal(external)));
  }

  /**
   * Creates external reference FormGroup.
   * @param external
   * @returns {FormGroup}
   */
  createExternal(external?): FormGroup {
    return this.fb.group({
      author: this.fb.control(external ? external.author : null, [
        Validators.required,
        textInputValidator(),
      ]),
      url: this.fb.control(external ? external.url : null, [
        Validators.required,
        Validators.pattern(validatorParams.reference.url.pattern),
        Validators.maxLength(validatorParams.reference.url.maxLength),
      ]),
      name: this.fb.control(external ? external.name : null, [
        Validators.required,
        Validators.maxLength(validatorParams.reference.name.maxLength),
        textInputValidator(),
      ]),
    });
  }

  /**
   * Adds external reference to externals array.
   */
  addExternal(): void {
    this.externalsArray.push(this.createExternal());
  }

  /**
   * Removes external reference at specific index from externals array.
   * @param {number} i
   */
  removeExternal(i: number): void {
    this.externalsArray.removeAt(i);
  }

  /**
   * Removes empty objects from externals array.
   */
  removeEmptyExternals(): void {
    this.externalsArray.controls.forEach(ctrl => {
      const author = ctrl.get('author');
      const url = ctrl.get('url');
      const name = ctrl.get('name');

      if (!author.value && !url.value && !name.value) {
        this.removeExternal(this.externalsArray.controls.findIndex(ext => ext === ctrl));
      }
    });
  }

  /**
   * Runs on submit. If form is valid and dirty, changed material is saved on sessionStorage.
   * If form is valid, redirects user to the next tab.
   */
  onSubmit(): void {
    this.submitted = true;

    this.removeEmptyExternals();

    if (this.form.valid) {
      if (this.form.dirty) {
        this.saveData();
      }

      this.router.navigate(['/muokkaa-oppimateriaalia', this.materialId, this.tabId + 1]);
    }
  }

  saveData(): void {
    const changedMaterial: EducationalMaterialForm = sessionStorage.getItem(environment.editMaterial) !== null
      ? JSON.parse(sessionStorage.getItem(environment.editMaterial))
      : this.material;

    changedMaterial.externals = this.externalsArray.value;

    sessionStorage.setItem(environment.editMaterial, JSON.stringify(changedMaterial));
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
