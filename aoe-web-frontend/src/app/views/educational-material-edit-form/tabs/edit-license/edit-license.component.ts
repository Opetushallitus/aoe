import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { EducationalMaterialForm } from '@models/educational-material-form'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { Observable, Subscription } from 'rxjs'
import { License } from '@models/koodisto/license'
import { KoodistoService } from '@services/koodisto.service'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'
import { Router } from '@angular/router'
import { Title } from '@angular/platform-browser'
import { MaterialService } from '@services/material.service'

@Component({
  selector: 'app-tabs-edit-license',
  templateUrl: './edit-license.component.html',
  styleUrls: ['./edit-license.component.scss'],
  standalone: false
})
export class EditLicenseComponent implements OnInit, OnDestroy {
  @Input() material: EducationalMaterialForm
  @Input() materialId: number
  @Input() tabId: number
  form: FormGroup
  lang: string = this.translate.currentLang
  submitted: boolean = false
  licenseSubscription: Subscription
  licenses$: Observable<License[]> = this.koodistoService.licenses$
  @Output() abortEdit: EventEmitter<any> = new EventEmitter()

  constructor(
    private fb: FormBuilder,
    private koodistoService: KoodistoService,
    private materialService: MaterialService,
    private router: Router,
    private titleService: Title,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.setTitle()

    this.form = this.fb.group({
      license: this.fb.control(null)
    })

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang

      this.setTitle()

      this.koodistoService.updateLicenses()
    })

    if (!this.materialService.getEducationalMaterialID()) {
      this.form.patchValue(this.material)
    } else {
      this.form.patchValue({ id: this.materialService.getEducationalMaterialID() })
    }
  }

  ngOnDestroy(): void {
    if (this.submitted === false && this.form.dirty && this.form.valid) {
      this.saveData()
    }
  }

  setTitle(): void {
    this.translate
      .get(['common.serviceName', 'titles.editMaterial.main', 'titles.editMaterial.license'])
      .subscribe((translations: { [key: string]: string }) => {
        this.titleService.setTitle(
          `${translations['titles.editMaterial.main']}: ${translations['titles.editMaterial.license']} - ${translations['common.serviceName']}`
        )
      })
  }

  get licenseCtrl(): FormControl {
    return this.form.get('license') as FormControl
  }

  /**
   * Runs on submit. If form is valid and dirty, changed material is saved on sessionStorage.
   * If form is valid, redirects user to the next tab.
   */
  onSubmit(): void {
    this.submitted = true
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
    changedMaterial.license = this.form.get('license').value
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
