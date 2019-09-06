import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';
import { getLocalStorageData } from '../../../../shared/shared.module';

@Component({
  selector: 'app-tabs-license',
  templateUrl: './license.component.html',
})
export class LicenseComponent implements OnInit {
  private localStorageKey = 'aoe.new-educational-resource';
  public lang: string = this.translate.currentLang;
  private savedData: any;

  public licenses$: any[];

  public licenseForm: FormGroup;

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
      license: this.fb.control(null, [Validators.required]),
    });

    this.koodistoProxySvc.getData('lisenssit', this.lang).subscribe(data => {
      this.licenses$ = data.map(row => ({ ...row, isCollapsed: true }));

      if (this.savedData) {
        if (this.savedData.license) {
          this.licenseForm.get('license').setValue(this.savedData.license);
        }
      }
    });
  }

  public onSubmit() {
    if (this.licenseForm.valid) {
      const newData = {
        license: this.licenseForm.get('license').value,
      };

      const data = Object.assign({}, getLocalStorageData(this.localStorageKey), newData);

      // save data to local storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));

      this.router.navigate(['/lisaa-oppimateriaali', 6]);
    }
  }

  public previousTab() {
    this.router.navigate(['/lisaa-oppimateriaali', 4]);
  }
}
