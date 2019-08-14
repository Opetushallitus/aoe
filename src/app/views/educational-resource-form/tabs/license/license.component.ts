import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TabsetComponent } from 'ngx-bootstrap';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';
import { getLocalStorageData } from '../../../../shared/shared.module';

@Component({
  selector: 'app-tabs-license',
  templateUrl: './license.component.html',
})
export class LicenseComponent implements OnInit {
  @Input() tabs: TabsetComponent;

  private localStorageKey = 'aoe.new-educational-resource';
  private lang: string = this.translate.currentLang;
  private savedData: any;

  public licenses$: any[];

  public licenseForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.savedData = getLocalStorageData(this.localStorageKey);

    this.licenseForm = this.fb.group({
      license: this.fb.control(null),
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

      this.tabs.tabs[5].active = true;
    }
  }

  public previousTab() {
    this.tabs.tabs[3].active = true;
  }
}
