import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { Router } from '@angular/router'
import { Observable } from 'rxjs'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'

import { environment } from '@environments/environment'
import { KoodistoService } from '@services/koodisto.service'
import { License } from '@models/koodisto/license'
import { Title } from '@angular/platform-browser'

@Component({
    selector: 'app-tabs-license',
    templateUrl: './license.component.html',
    standalone: false
})
export class LicenseComponent implements OnInit, OnDestroy {
  @Output() abortEdit: EventEmitter<boolean> = new EventEmitter<boolean>()

  lang: string = this.translate.currentLang
  savedData: any
  licenses$: Observable<License[]> = this.koodistoService.licenses$
  form: FormGroup
  submitted: boolean = false

  constructor(
    private fb: FormBuilder,
    private koodistoService: KoodistoService,
    private translate: TranslateService,
    private router: Router,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.setTitle()
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang
      this.setTitle()
      this.koodistoService.updateLicenses()
    })
    this.savedData = JSON.parse(sessionStorage.getItem(environment.newERLSKey))
    this.form = this.fb.group({
      license: this.fb.control(null)
    })
    if (this.savedData) {
      if (this.savedData.license) {
        this.license.setValue(this.savedData.license)
      }
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
      .get(['common.serviceName', 'titles.addMaterial.main', 'titles.addMaterial.license'])
      .subscribe((translations: { [key: string]: string }) => {
        this.titleService.setTitle(
          `${translations['titles.addMaterial.main']}: ${translations['titles.addMaterial.license']} - ${translations['common.serviceName']}`
        )
      })
  }

  get license(): FormControl {
    return this.form.get('license') as FormControl
  }

  onSubmit(): void {
    this.submitted = true
    if (this.form.valid) {
      if (this.form.dirty) {
        this.saveData()
      }
      void this.router.navigate(['/lisaa-oppimateriaali', 6])
    }
  }

  saveData(): void {
    const data = Object.assign(
      {},
      JSON.parse(sessionStorage.getItem(environment.newERLSKey)),
      this.form.value
    )

    // save data to session storage
    sessionStorage.setItem(environment.newERLSKey, JSON.stringify(data))
  }

  previousTab(): void {
    void this.router.navigate(['/lisaa-oppimateriaali', 4])
  }

  abort(): void {
    this.abortEdit.emit(true)
  }
}
