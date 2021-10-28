import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  CollectionCard,
  CollectionCardEducationalLevel,
  CollectionCardKeyword,
} from '@models/collections/collection-card';
import { getValuesWithinLimits } from '../../shared/shared.module';
import { Subscription } from 'rxjs';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '@models/koodisto-proxy/language';

@Component({
  selector: 'app-collection-card',
  templateUrl: './collection-card.component.html',
  styleUrls: ['./collection-card.component.scss'],
})
export class CollectionCardComponent implements OnInit, OnDestroy {
  @Input() collection: CollectionCard;
  educationalLevels: CollectionCardEducationalLevel[];
  keywords: CollectionCardKeyword[];
  languageSubscription: Subscription;
  languages: Language[];

  constructor(private translate: TranslateService, private koodistoSvc: KoodistoProxyService) {}

  ngOnInit(): void {
    this.translate.onLangChange.subscribe(() => {
      this.koodistoSvc.updateLanguages();
    });

    this.languageSubscription = this.koodistoSvc.languages$.subscribe((languages: Language[]) => {
      this.languages = languages.filter((lang: Language) => this.collection.languages.includes(lang.key.toLowerCase()));
    });
    this.koodistoSvc.updateLanguages();

    this.educationalLevels = getValuesWithinLimits(this.collection.educationalLevels, 'value');
    this.keywords = getValuesWithinLimits(this.collection.keywords, 'value');
  }

  ngOnDestroy(): void {
    this.languageSubscription.unsubscribe();
  }
}
