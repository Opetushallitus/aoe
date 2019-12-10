import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { environment } from '../../../../../environments/environment';
import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';
import { License } from '../../../../models/koodisto-proxy/license';

@Component({
  selector: 'app-tabs-license',
  templateUrl: './license.component.html',
})
export class LicenseComponent implements OnInit, OnDestroy {
  private savedDataKey = environment.newERLSKey;
  private fileUploadLSKey = environment.fileUploadLSKey;
  lang: string = this.translate.currentLang;
  savedData: any;

  licenseSubscription: Subscription;
  licenses: License[];

  licenseForm: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.koodistoProxySvc.updateLicenses();
    });

    this.licenseSubscription = this.koodistoProxySvc.licenses$
      .subscribe((licenses: License[]) => {
        this.licenses = licenses;
      });
    this.koodistoProxySvc.updateLicenses();

    this.savedData = JSON.parse(sessionStorage.getItem(this.savedDataKey));

    this.licenseForm = this.fb.group({
      license: this.fb.control(null, [ Validators.required ]),
    });

    if (this.savedData) {
      if (this.savedData.license) {
        this.license.setValue(this.savedData.license);
      }
    }
  }

  ngOnDestroy(): void {
    this.licenseSubscription.unsubscribe();
  }

  get license(): FormControl {
    return this.licenseForm.get('license') as FormControl;
  }

  onSubmit() {
    this.submitted = true;

    if (this.licenseForm.valid) {
      const data = Object.assign(
        {},
        JSON.parse(sessionStorage.getItem(this.savedDataKey)),
        this.licenseForm.value
      );

      // save data to session storage
      sessionStorage.setItem(this.savedDataKey, JSON.stringify(data));

      this.router.navigate(['/lisaa-oppimateriaali', 6]);
    }
  }

  resetForm() {
    // reset submit status
    this.submitted = false;

    // reset form values
    this.licenseForm.reset();

    // clear data from session storage
    sessionStorage.removeItem(this.savedDataKey);
    sessionStorage.removeItem(this.fileUploadLSKey);
  }

  previousTab() {
    this.router.navigate(['/lisaa-oppimateriaali', 4]);
  }
}
