import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { environment } from '../../../../../environments/environment';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { License } from '@models/koodisto-proxy/license';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-tabs-license',
  templateUrl: './license.component.html',
})
export class LicenseComponent implements OnInit, OnDestroy {
  lang: string = this.translate.currentLang;
  savedData: any;

  licenseSubscription: Subscription;
  licenses: License[];

  form: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
    private router: Router,
    private titleSvc: Title,
  ) { }

  ngOnInit() {
    this.setTitle();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.setTitle();

      this.koodistoProxySvc.updateLicenses();
    });

    this.licenseSubscription = this.koodistoProxySvc.licenses$
      .subscribe((licenses: License[]) => {
        this.licenses = licenses;
      });
    this.koodistoProxySvc.updateLicenses();

    this.savedData = JSON.parse(sessionStorage.getItem(environment.newERLSKey));

    this.form = this.fb.group({
      license: this.fb.control(null),
    });

    if (this.savedData) {
      if (this.savedData.license) {
        this.license.setValue(this.savedData.license);
      }
    }
  }

  ngOnDestroy(): void {
    // save data if its valid, dirty and not submitted
    if (this.submitted === false && this.form.dirty && this.form.valid) {
      this.saveData();
    }

    this.licenseSubscription.unsubscribe();
  }

  setTitle(): void {
    this.translate.get('titles.addMaterial').subscribe((translations: any) => {
      this.titleSvc.setTitle(`${translations.main}: ${translations.license} ${environment.title}`);
    });
  }

  get license(): FormControl {
    return this.form.get('license') as FormControl;
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.valid) {
      if (this.form.dirty) {
        this.saveData();
      }

      this.router.navigate(['/lisaa-oppimateriaali', 6]);
    }
  }

  saveData(): void {
    const data = Object.assign(
      {},
      JSON.parse(sessionStorage.getItem(environment.newERLSKey)),
      this.form.value
    );

    // save data to session storage
    sessionStorage.setItem(environment.newERLSKey, JSON.stringify(data));
  }

  resetForm() {
    // reset submit status
    this.submitted = false;

    // reset form values
    this.form.reset();

    // clear data from session storage
    sessionStorage.removeItem(environment.newERLSKey);
    sessionStorage.removeItem(environment.fileUploadLSKey);

    this.router.navigateByUrl('/');
  }

  previousTab() {
    this.router.navigate(['/lisaa-oppimateriaali', 4]);
  }
}
