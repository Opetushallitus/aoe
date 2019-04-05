import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { KoodistoProxyService } from '../../../services/koodisto-proxy.service';

@Component({
  selector: 'app-extended-details',
  templateUrl: './extended-details.component.html',
})
export class ExtendedDetailsComponent implements OnInit {
  private lang: string = this.translate.currentLang;
  public educationalRoles$: Observable<any>;
  public educationalUse$: Observable<any>;
  public accessibilityFeatures$: Observable<any>;
  public accessibilityAPIs$: Observable<any>;
  public accessibilityControls$: Observable<any>;
  public accessibilityHazards$: Observable<any>;
  public languages$: Observable<any>;

  extendedDetailsForm = new FormGroup({
    educationalRoles: new FormControl(''),
    educationalUse: new FormControl(''),
    accessibilityFeatures: new FormControl(''),
    accessibilityAPIs: new FormControl(''),
    accessibilityControls: new FormControl(''),
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

    this.accessibilityAPIs$ = this.koodistoProxySvc.getData('saavutettavuudenavustavatteknologiat', this.lang);

    this.accessibilityControls$ = this.koodistoProxySvc.getData('saavutettavuudenkayttotavat', this.lang);

    this.accessibilityHazards$ = this.koodistoProxySvc.getData('saavutettavuudenesteet', this.lang);

    this.languages$ = this.koodistoProxySvc.getData('kielet', this.lang);
  }

  onSubmit() {
    console.warn(this.extendedDetailsForm.value);
  }
}
