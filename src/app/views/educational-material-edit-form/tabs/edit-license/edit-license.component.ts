import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EducationalMaterialForm } from '@models/educational-material-form';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { License } from '@models/koodisto-proxy/license';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-tabs-edit-license',
  templateUrl: './edit-license.component.html',
  styleUrls: ['./edit-license.component.scss']
})
export class EditLicenseComponent implements OnInit, OnDestroy {
  @Input() material: EducationalMaterialForm;
  @Input() materialId: number;
  @Input() tabId: number;
  form: FormGroup;
  lang: string = this.translate.currentLang;
  submitted = false;
  licenseSubscription: Subscription;
  licenses: License[];
  @Output() abortEdit = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private koodistoSvc: KoodistoProxyService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      license: this.fb.control(null, [ Validators.required ]),
    });

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.koodistoSvc.updateLicenses();
    });

    if (sessionStorage.getItem(environment.editMaterial) === null) {
      this.form.patchValue(this.material);
    } else {
      this.form.patchValue(JSON.parse(sessionStorage.getItem(environment.editMaterial)));
    }

    // licenses
    this.licenseSubscription = this.koodistoSvc.licenses$.subscribe((licenses: License[]) => {
      this.licenses = licenses;
    });
    this.koodistoSvc.updateLicenses();
  }

  ngOnDestroy(): void {
    this.licenseSubscription.unsubscribe();
  }

  get licenseCtrl(): FormControl {
    return this.form.get('license') as FormControl;
  }

  /**
   * Runs on submit. If form is valid and dirty, changed material is saved on sessionStorage.
   * If form is valid, redirects user to the next tab.
   */
  onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      if (this.form.dirty) {
        const changedMaterial: EducationalMaterialForm = sessionStorage.getItem(environment.editMaterial) !== null
          ? JSON.parse(sessionStorage.getItem(environment.editMaterial))
          : this.material;

        changedMaterial.license = this.form.get('license').value;

        sessionStorage.setItem(environment.editMaterial, JSON.stringify(changedMaterial));
      }

      this.router.navigate(['/muokkaa-oppimateriaalia', this.materialId, this.tabId + 1]);
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
