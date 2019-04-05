import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { KoodistoProxyService } from '../../../services/koodisto-proxy.service';

@Component({
  selector: 'app-based-on-details',
  templateUrl: './based-on-details.component.html',
})
export class BasedOnDetailsComponent implements OnInit {
  private lang: string = this.translate.currentLang;

  basedOnDetailsForm = new FormGroup({
    author: new FormControl(''),
    material: new FormControl(''),
  });

  constructor(
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });
  }

  onSubmit() {
    console.warn(this.basedOnDetailsForm.value);
  }
}
