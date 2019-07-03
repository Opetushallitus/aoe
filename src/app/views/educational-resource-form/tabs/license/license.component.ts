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
      license: this.fb.control(null),
    });

    this.koodistoProxySvc.getData('lisenssit', this.lang).subscribe(data => {
      this.licenses$ = data;

      if (this.savedData) {
        this.licenseForm.get('license').setValue(this.savedData.license);
      }
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.licenseForm.valid) {
      const newData = {
        license: this.licenseForm.get('license').value,
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
