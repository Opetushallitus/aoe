import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { Title } from '@angular/platform-browser'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'
import { textInputValidator } from '../../../../shared/shared.module'
import { validatorParams } from '@constants/validator-params'
import { EducationalMaterialForm } from '@models/educational-material-form'
import { ExternalReference } from '@models/material/external-reference'
import { MaterialService } from '@services/material.service'

@Component({
  selector: 'app-tabs-edit-based-on-details',
  templateUrl: './edit-based-on-details.component.html',
  styleUrls: ['./edit-based-on-details.component.scss']
})
export class EditBasedOnDetailsComponent implements OnInit, OnDestroy {
  @Input() material: EducationalMaterialForm
  @Input() materialId: number
  @Input() tabId: number
  form: FormGroup
  submitted: boolean = false
  @Output() abortEdit: EventEmitter<any> = new EventEmitter()

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private router: Router,
    private translate: TranslateService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.setTitle()

    this.form = this.fb.group({
      externals: this.fb.array([])
    })

    this.translate.onLangChange.subscribe((_event: LangChangeEvent) => {
      this.setTitle()
    })

    if (this.materialService) {
      this.form.patchValue(this.material)
      this.patchExternals(this.material.externals)
    } else {
      const editMaterial: EducationalMaterialForm =
        this.materialService.getEducationalMaterialEditForm()
      this.form.patchValue(editMaterial)
      this.patchExternals(editMaterial.externals)
    }
  }

  ngOnDestroy(): void {
    if (this.submitted === false && this.form.dirty && this.form.valid) {
      this.saveData()
    }
  }

  setTitle(): void {
    this.translate
      .get(['common.serviceName', 'titles.editMaterial.main', 'titles.editMaterial.references'])
      .subscribe((translations: { [key: string]: string }) => {
        this.titleService.setTitle(
          `${translations['titles.editMaterial.main']}: ${translations['titles.editMaterial.references']} - ${translations['common.serviceName']}`
        )
      })
  }

  get externalsArray(): FormArray {
    return this.form.get('externals') as FormArray
  }

  /**
   * Patches external references array.
   * @param {ExternalReference[]} externals
   */
  patchExternals(externals: ExternalReference[]): void {
    externals.forEach((external: ExternalReference) =>
      this.externalsArray.push(this.createExternal(external))
    )
  }

  /**
   * Creates external reference FormGroup.
   * @param {ExternalReference} external
   * @returns {FormGroup}
   */
  createExternal(external?: ExternalReference): FormGroup {
    return this.fb.group({
      author: this.fb.control(external?.author ?? null, [
        Validators.required,
        textInputValidator()
      ]),
      url: this.fb.control(external?.url ?? null, [
        Validators.required,
        Validators.pattern(validatorParams.reference.url.pattern),
        Validators.maxLength(validatorParams.reference.url.maxLength)
      ]),
      name: this.fb.control(external?.name ?? null, [
        Validators.required,
        Validators.maxLength(validatorParams.reference.name.maxLength),
        textInputValidator()
      ])
    })
  }

  /**
   * Adds external reference to externals array.
   */
  addExternal(): void {
    this.externalsArray.push(this.createExternal())
  }

  /**
   * Removes external reference at specific index from externals array.
   * @param {number} i
   */
  removeExternal(i: number): void {
    this.externalsArray.removeAt(i)
    this.form.markAsDirty()
  }

  /**
   * Removes empty objects from externals array.
   */
  removeEmptyExternals(): void {
    this.externalsArray.controls.forEach((ctrl) => {
      const author = ctrl.get('author')
      const url = ctrl.get('url')
      const name = ctrl.get('name')
      if (!author.value && !url.value && !name.value) {
        this.removeExternal(this.externalsArray.controls.findIndex((ext) => ext === ctrl))
      }
    })
  }

  /**
   * Runs on submit. If form is valid and dirty, changed material is saved on sessionStorage.
   * If form is valid, redirects user to the next tab.
   */
  onSubmit(): void {
    this.submitted = true
    this.removeEmptyExternals()
    if (this.form.valid) {
      if (this.form.dirty) {
        this.saveData()
      }
      void this.router.navigate(['/muokkaa-oppimateriaalia', this.materialId, this.tabId + 1])
    }
  }

  saveData(): void {
    const changedMaterial: EducationalMaterialForm =
      this.materialService.getEducationalMaterialEditForm()
        ? this.materialService.getEducationalMaterialEditForm()
        : this.material
    changedMaterial.externals = this.externalsArray.value
    this.materialService.setEducationalMaterialEditForm(changedMaterial)
  }

  /**
   * Emits EventEmitter indicating user wants to abort.
   */
  abort(): void {
    this.abortEdit.emit()
  }

  /**
   * Redirects user to previous tab.
   */
  previous(): void {
    void this.router.navigate(['/muokkaa-oppimateriaalia', this.materialId, this.tabId - 1])
  }
}
