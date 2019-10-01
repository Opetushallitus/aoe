import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { environment } from '../../../../../environments/environment';
import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';
import { getLocalStorageData } from '../../../../shared/shared.module';

@Component({
  selector: 'app-tabs-license',
  templateUrl: './license.component.html',
})
export class LicenseComponent implements OnInit {
  private localStorageKey = environment.newERLSKey;
  private fileUploadLSKey = environment.fileUploadLSKey;
  public lang: string = this.translate.currentLang;
  private savedData: any;

  public licenses$: any[];

  public licenseForm: FormGroup;
  public submitted = false;

  constructor(
    private fb: FormBuilder,
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.savedData = getLocalStorageData(this.localStorageKey);

    this.licenseForm = this.fb.group({
      license: this.fb.control(null, [ Validators.required ]),
    });

    this.koodistoProxySvc.getData('lisenssit', this.lang).subscribe(data => {
      this.licenses$ = data.map(row => ({ ...row, isCollapsed: true }));

      if (this.savedData) {
        if (this.savedData.license) {
          this.license.setValue(this.savedData.license);
        }
      }
    });
  }

  get license(): FormControl {
    return this.licenseForm.get('license') as FormControl;
  }

  public onSubmit() {
    this.submitted = true;

    if (this.licenseForm.valid) {
      const data = Object.assign(
        {},
        getLocalStorageData(this.localStorageKey),
        this.licenseForm.value
      );

      // save data to local storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));

      this.router.navigate(['/lisaa-oppimateriaali', 6]);
    }
  }

  // @todo: some kind of confirmation
  public resetForm() {
    // reset submit status
    this.submitted = false;

    // reset form values
    this.licenseForm.reset();

    // clear data from local storage
    localStorage.removeItem(this.localStorageKey);
    localStorage.removeItem(this.fileUploadLSKey);
  }

  public previousTab() {
    this.router.navigate(['/lisaa-oppimateriaali', 4]);
  }
}
