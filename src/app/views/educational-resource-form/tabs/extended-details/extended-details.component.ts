import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { TabsetComponent } from 'ngx-bootstrap';

import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';

@Component({
  selector: 'app-tabs-extended-details',
  templateUrl: './extended-details.component.html',
})
export class ExtendedDetailsComponent implements OnInit {
  @Input() tabs: TabsetComponent;

  private localStorageKey = 'aoe.new-educational-resource';
  public submitted = false;
  private lang: string = this.translate.currentLang;
  private savedData = JSON.parse(localStorage.getItem(this.localStorageKey));

  public educationalRoles$: Observable<any>;
  public educationalUse$: Observable<any>;
  public accessibilityFeatures$: Observable<any>;
  public accessibilityHazards$: Observable<any>;
  public languages$: Observable<any>;

  public extendedDetailsForm = new FormGroup({
    educationalRoles: new FormControl(''),
    educationalUse: new FormControl(''),
    accessibilityFeatures: new FormControl(''),
    accessibilityHazards: new FormControl(''),
    typicalAgeRangeMin: new FormControl(''),
    typicalAgeRangeMax: new FormControl(''),
    inLanguage: new FormControl(''),
  });

  constructor(
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.educationalRoles$ = this.koodistoProxySvc.getData('kohderyhmat', this.lang);
    this.educationalUse$ = this.koodistoProxySvc.getData('kayttokohteet', this.lang);
    this.accessibilityFeatures$ = this.koodistoProxySvc.getData('saavutettavuudentukitoiminnot', this.lang);
    this.accessibilityHazards$ = this.koodistoProxySvc.getData('saavutettavuudenesteet', this.lang);
    this.languages$ = this.koodistoProxySvc.getData('kielet', this.lang);

    if (this.savedData) {
      this.extendedDetailsForm.get('educationalRoles').setValue(this.savedData.educationalRole);
      this.extendedDetailsForm.get('educationalUse').setValue(this.savedData.educationalUse);
      this.extendedDetailsForm.get('accessibilityFeatures').setValue(this.savedData.accessibilityFeature);
      this.extendedDetailsForm.get('accessibilityHazards').setValue(this.savedData.accessibilityHazard);
      this.extendedDetailsForm.get('typicalAgeRangeMin').setValue(this.savedData.typicalAgeRange[0].min);
      this.extendedDetailsForm.get('typicalAgeRangeMax').setValue(this.savedData.typicalAgeRange[0].max);
      this.extendedDetailsForm.get('inLanguage').setValue(this.savedData.inLanguage);
    }
  }

  onSubmit() {
    this.submitted = true;

    if (!this.extendedDetailsForm.invalid) {
      const newData = {
        educationalRole: this.extendedDetailsForm.get('educationalRoles').value,
        educationalUse: this.extendedDetailsForm.get('educationalUse').value,
        accessibilityFeature: this.extendedDetailsForm.get('accessibilityFeatures').value,
        accessibilityHazard: this.extendedDetailsForm.get('accessibilityHazards').value,
        typicalAgeRange: [{
          min: this.extendedDetailsForm.get('typicalAgeRangeMin').value,
          max: this.extendedDetailsForm.get('typicalAgeRangeMax').value,
        }],
        inLanguage: this.extendedDetailsForm.get('inLanguage').value,
      };

      const data = Object.assign({}, this.savedData, newData);

      // save data to local storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));

      this.tabs.tabs[4].active = true;
    }
  }

  // @todo: some kind of confirmation
  resetForm() {
    // reset form values
    this.extendedDetailsForm.reset();

    // clear data from local storage
    localStorage.removeItem(this.localStorageKey);
  }

  previousTab() {
    this.tabs.tabs[2].active = true;
  }
}
