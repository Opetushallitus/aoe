import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core'
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { Title } from '@angular/platform-browser'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'

import { environment } from '@environments/environment'
import { textInputValidator } from '@shared/shared.module'
import { validatorParams } from '@constants/validator-params'
import { ExternalReference } from '@models/material/external-reference'

@Component({
  selector: 'app-tabs-based-on-details',
  templateUrl: './based-on-details.component.html',
  standalone: false
})
export class BasedOnDetailsComponent implements OnInit, OnDestroy {
  @Output() abortEdit: EventEmitter<boolean> = new EventEmitter<boolean>()

  lang: string = this.translate.currentLang
  savedData: any

  form: FormGroup
  submitted = false

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private router: Router,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.setTitle()

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang

      this.setTitle()
    })

    this.savedData = JSON.parse(sessionStorage.getItem(environment.newERLSKey))

    this.form = this.fb.group({
      // internals: this.fb.array([ this.createInternal() ]),
      externals: this.fb.array([this.createExternal()])
    })

    if (this.savedData?.isBasedOn?.externals?.length > 0) {
      this.removeExternal(0)

      this.savedData.isBasedOn.externals.forEach((external: ExternalReference) => {
        this.externals.push(this.createExternal(external))
      })
    }
  }

  ngOnDestroy(): void {
    // save data if its valid, dirty and not submitted
    if (this.submitted === false && this.form.dirty && this.form.valid) {
      this.saveData()
    }
  }

  setTitle(): void {
    this.translate
      .get(['common.serviceName', 'titles.addMaterial.main', 'titles.addMaterial.references'])
      .subscribe((translations: { [key: string]: string }) => {
        this.titleService.setTitle(
          `${translations['titles.addMaterial.main']}: ${translations['titles.addMaterial.references']} - ${translations['common.serviceName']}`
        )
      })
  }

  /*get internals(): FormArray {
    return this.form.get('internals') as FormArray;
  }*/

  get externals(): FormArray {
    return this.form.get('externals') as FormArray
  }

  /*createInternal(): FormGroup {
    return this.fb.group({
      author: this.fb.control(null),
      materialId: this.fb.control(null),
    });
  }*/

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

  /*addInternal(): void {
    this.internals.push(this.createInternal());
  }*/

  addExternal(): void {
    this.externals.push(this.createExternal())
  }

  /*removeInternal(i: number): void {
    this.internals.removeAt(i);
  }*/

  removeExternal(i: number): void {
    this.externals.removeAt(i)
    this.form.markAsDirty()
  }

  validateExternals(): void {
    this.externals.controls.forEach((ctrl) => {
      const author = ctrl.get('author')
      const url = ctrl.get('url')
      const name = ctrl.get('name')

      if (!author.value && !url.value && !name.value) {
        this.removeExternal(this.externals.controls.findIndex((ext) => ext === ctrl))
      }
    })
  }

  onSubmit(): void {
    this.submitted = true
    this.validateExternals()

    if (this.form.valid) {
      if (this.form.dirty) {
        this.saveData()
      }
      void this.router.navigate(['/lisaa-oppimateriaali', 7])
    }
  }

  saveData(): void {
    const basedOnData = {
      isBasedOn: {
        // internals: this.form.get('internals').value,
        externals: this.form.get('externals').value
      }
    }

    const data = Object.assign(
      {},
      JSON.parse(sessionStorage.getItem(environment.newERLSKey)),
      basedOnData
    )

    // save data to session storage
    sessionStorage.setItem(environment.newERLSKey, JSON.stringify(data))
  }

  previousTab(): void {
    void this.router.navigate(['/lisaa-oppimateriaali', 2])
  }

  abort(): void {
    this.abortEdit.emit(true)
  }
}
