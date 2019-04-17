import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { TabsetComponent } from 'ngx-bootstrap';

import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';

@Component({
  selector: 'app-tabs-educational-details',
  templateUrl: './educational-details.component.html',
})
export class EducationalDetailsComponent implements OnInit {
  @Input() tabs: TabsetComponent;

  private lang: string = this.translate.currentLang;
  public educationalLevels$: Observable<any>;

  educationalDetailsForm = new FormGroup({
    educationalLevels: new FormControl(''),
  });

  constructor(
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.educationalLevels$ = this.koodistoProxySvc.getData('koulutusasteet', this.lang);
  }

  onSubmit() {
    console.warn(this.educationalDetailsForm.value);
  }
}
