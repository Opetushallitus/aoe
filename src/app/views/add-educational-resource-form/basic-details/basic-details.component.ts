import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { KoodistoProxyService } from '../../../services/koodisto-proxy.service';

@Component({
  selector: 'app-basic-details',
  templateUrl: './basic-details.component.html',
})
export class BasicDetailsComponent implements OnInit, OnDestroy {
  private lang: string = this.translate.currentLang;
  public organisations$: Observable<any>;
  private organisationsSubscription: Subscription;

  constructor(
    public koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.organisationsSubscription = this.koodistoProxySvc.getData('organisaatiot', this.lang).subscribe(data => {
      this.organisations$ = data;
    });
  }

  ngOnDestroy(): void {
    this.organisationsSubscription.unsubscribe();
  }
}
