import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';
import { getLocalStorageData } from '../../../../shared/shared.module';

@Component({
  selector: 'app-tabs-extended-details',
  templateUrl: './extended-details.component.html',
})
export class ExtendedDetailsComponent implements OnInit {
  private localStorageKey = 'aoe.new-educational-resource';
  private lang: string = this.translate.currentLang;
  private savedData: any;

  public accessibilityFeatures$: any[];
  public accessibilityHazards$: any[];

  public extendedDetailsForm: FormGroup;

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

    this.extendedDetailsForm = this.fb.group({
      accessibilityFeatures: this.fb.control(null),
      accessibilityHazards: this.fb.control(null),
      typicalAgeRangeMin: this.fb.control(null),
      typicalAgeRangeMax: this.fb.control(null),
      timeRequired: this.fb.control(null),
      publisher: this.fb.control(null),
      expires: this.fb.control(null),
    });

    this.koodistoProxySvc.getData('saavutettavuudentukitoiminnot', this.lang).subscribe(data => {
      this.accessibilityFeatures$ = data;
    });

    this.koodistoProxySvc.getData('saavutettavuudenesteet', this.lang).subscribe(data => {
      this.accessibilityHazards$ = data;
    });

    if (this.savedData) {
      if (this.savedData.accessibilityFeature) {
        this.extendedDetailsForm.get('accessibilityFeatures').setValue(this.savedData.accessibilityFeature);
      }

      if (this.savedData.accessibilityHazard) {
        this.extendedDetailsForm.get('accessibilityHazards').setValue(this.savedData.accessibilityHazard);
      }

      if (this.savedData.typicalAgeRange) {
        this.extendedDetailsForm.get('typicalAgeRangeMin').setValue(this.savedData.typicalAgeRange[0].min);
        this.extendedDetailsForm.get('typicalAgeRangeMax').setValue(this.savedData.typicalAgeRange[0].max);
      }

      if (this.savedData.timeRequired) {
        this.extendedDetailsForm.get('timeRequired').setValue(this.savedData.timeRequired);
      }

      if (this.savedData.publisher) {
        this.extendedDetailsForm.get('publisher').setValue(this.savedData.publisher);
      }

      if (this.savedData.expires) {
        this.extendedDetailsForm.get('expires').setValue(new Date(this.savedData.expires));
      }
    }
  }

  public onSubmit() {
    if (this.extendedDetailsForm.valid) {
      const newData = {
        accessibilityFeature: this.extendedDetailsForm.get('accessibilityFeatures').value,
        accessibilityHazard: this.extendedDetailsForm.get('accessibilityHazards').value,
        typicalAgeRange: [{
          min: this.extendedDetailsForm.get('typicalAgeRangeMin').value,
          max: this.extendedDetailsForm.get('typicalAgeRangeMax').value,
        }],
        timeRequired: this.extendedDetailsForm.get('timeRequired').value,
        publisher: this.extendedDetailsForm.get('publisher').value,
        expires: this.extendedDetailsForm.get('expires').value,
      };

      const data = Object.assign({}, getLocalStorageData(this.localStorageKey), newData);

      // save data to local storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));
    }
  }

  // @todo: some kind of confirmation
  public resetForm() {
    // reset form values
    this.extendedDetailsForm.reset();

    // clear data from local storage
    localStorage.removeItem(this.localStorageKey);
  }

  public previousTab() {
    // this.tabs.tabs[2].active = true;
  }
}
