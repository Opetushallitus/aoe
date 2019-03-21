import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { KoodistoTestiService } from '../../services/koodisto-testi.service';

@Component({
  selector: 'app-koodisto-testi',
  templateUrl: './koodisto-testi.component.html',
})
export class KoodistoTestiComponent implements OnInit, OnDestroy {
  public languages$: Observable<any>;
  public organisations$: Observable<any>;
  private lang: string = this.translate.currentLang;
  private languagesSubscription: Subscription;
  private organisationsSubscription: Subscription;

  constructor(
    public koodistoSvc: KoodistoTestiService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.languagesSubscription = this.koodistoSvc.getLanguages(this.lang).subscribe(data => {
      this.languages$ = data;
    });

    this.organisationsSubscription = this.koodistoSvc.getOrganisations(this.lang).subscribe(data => {
      this.organisations$ = data;
    });
  }

  ngOnDestroy(): void {
    this.languagesSubscription.unsubscribe();
    this.organisationsSubscription.unsubscribe();
  }
}
