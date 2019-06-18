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
  public accessibilityAPIs$: Observable<any>;
  public accessibilityControls$: Observable<any>;
  public accessibilityHazards$: Observable<any>;
  public languages$: Observable<any>;
  public licenses$: any[];
  public selectedLicense: any;

  public extendedDetailsForm = new FormGroup({
    educationalRoles: new FormControl(''),
    educationalUse: new FormControl(''),
    accessibilityFeatures: new FormControl(''),
    accessibilityAPIs: new FormControl(''),
    accessibilityControls: new FormControl(''),
    accessibilityHazards: new FormControl(''),
    typicalAgeRangeMin: new FormControl(''),
    typicalAgeRangeMax: new FormControl(''),
    inLanguage: new FormControl(''),
    licenseCommercialUse: new FormControl('yes'),
    licenseSharing: new FormControl('yes'),
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

    this.accessibilityAPIs$ = this.koodistoProxySvc.getData('saavutettavuudenavustavatteknologiat', this.lang);

    this.accessibilityControls$ = this.koodistoProxySvc.getData('saavutettavuudenkayttotavat', this.lang);

    this.accessibilityHazards$ = this.koodistoProxySvc.getData('saavutettavuudenesteet', this.lang);

    this.languages$ = this.koodistoProxySvc.getData('kielet', this.lang);

    this.koodistoProxySvc.getData('lisenssit', this.lang).subscribe(data => {
      this.licenses$ = data;

      this.selectedLicense = this.licenses$.find(license => license.key === 'CCBY4.0');
    });

    if (this.savedData) {
      this.extendedDetailsForm.get('educationalRoles').setValue(this.savedData.educationalRole);
      this.extendedDetailsForm.get('educationalUse').setValue(this.savedData.educationalUse);
      this.extendedDetailsForm.get('accessibilityFeatures').setValue(this.savedData.accessibilityFeature);
      this.extendedDetailsForm.get('accessibilityAPIs').setValue(this.savedData.accessibilityAPI);
      this.extendedDetailsForm.get('accessibilityControls').setValue(this.savedData.accessibilityControl);
      this.extendedDetailsForm.get('accessibilityHazards').setValue(this.savedData.accessibilityHazard);
      this.extendedDetailsForm.get('typicalAgeRangeMin').setValue(this.savedData.typicalAgeRange[0].min);
      this.extendedDetailsForm.get('typicalAgeRangeMax').setValue(this.savedData.typicalAgeRange[0].max);
      this.extendedDetailsForm.get('inLanguage').setValue(this.savedData.inLanguage);
    }

    this.onChanges();
  }

  onChanges() {
    this.extendedDetailsForm.valueChanges.subscribe(val => {
      let licenseKey = 'CCBY';

      if (val.licenseCommercialUse === 'no') {
        licenseKey += 'NC';
      }

      if (val.licenseSharing === 'no') {
        licenseKey += 'ND';
      } else if (val.licenseSharing === 'shareAlike') {
        licenseKey += 'SA';
      }

      this.selectedLicense = this.licenses$.find(license => license.key === `${licenseKey}4.0`);
    });
  }

  onSubmit() {
    this.submitted = true;

    if (!this.extendedDetailsForm.invalid) {
      const newData = {
        educationalRole: this.extendedDetailsForm.get('educationalRoles').value,
        educationalUse: this.extendedDetailsForm.get('educationalUse').value,
        accessibilityFeature: this.extendedDetailsForm.get('accessibilityFeatures').value,
        accessibilityAPI: this.extendedDetailsForm.get('accessibilityAPIs').value,
        accessibilityControl: this.extendedDetailsForm.get('accessibilityControls').value,
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
