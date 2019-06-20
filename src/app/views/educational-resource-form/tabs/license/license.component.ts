import { Component, Input, OnInit } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';

@Component({
  selector: 'app-tabs-license',
  templateUrl: './license.component.html',
})
export class LicenseComponent implements OnInit {
  @Input() tabs: TabsetComponent;

  private localStorageKey = 'aoe.new-educational-resource';
  public submitted = false;
  private lang: string = this.translate.currentLang;
  private savedData = JSON.parse(localStorage.getItem(this.localStorageKey));
  public licenseForm: FormGroup;

  public licenses$: any[];
  public selectedLicense: any;

  constructor(
    private fb: FormBuilder,
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.licenseForm = this.fb.group({
      licenseCommercialUse: this.fb.control(null),
      licenseSharing: this.fb.control(null),
      license: this.fb.control(null),
    });

    this.koodistoProxySvc.getData('lisenssit', this.lang).subscribe(data => {
      this.licenses$ = data;

      if (this.savedData) {
        this.setLicense(this.savedData.licenseCommercialUse, this.savedData.licenseSharing);

        this.licenseForm.get('licenseCommercialUse').setValue(this.savedData.licenseCommercialUse);
        this.licenseForm.get('licenseSharing').setValue(this.savedData.licenseSharing);
        this.licenseForm.get('license').setValue(this.savedData.license);
      }
    });

    this.onChanges();
  }

  setLicense(commercialUse, sharing) {
    let licenseKey = 'CCBY';

    if (commercialUse === 'no') {
      licenseKey += 'NC';
    }

    if (sharing === 'no') {
      licenseKey += 'ND';
    } else if (sharing === 'shareAlike') {
      licenseKey += 'SA';
    }

    this.selectedLicense = this.licenses$.find(license => license.key === `${licenseKey}4.0`);
  }

  onChanges() {
    this.licenseForm.valueChanges.subscribe(val => {
      this.setLicense(val.licenseCommercialUse, val.licenseSharing);
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.licenseForm.valid) {
      this.setLicense(this.licenseForm.get('licenseCommercialUse').value, this.licenseForm.get('licenseSharing').value);

      const newData = {
        licenseCommercialUse: this.licenseForm.get('licenseCommercialUse').value,
        licenseSharing: this.licenseForm.get('licenseSharing').value,
        license: this.selectedLicense.key,
      };

      const data = Object.assign({}, this.savedData, newData);

      // save data to local storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));

      this.tabs.tabs[5].active = true;
    }
  }

  previousTab() {
    this.tabs.tabs[3].active = true;
  }
}
