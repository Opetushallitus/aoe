import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
    CollectionCard,
    CollectionCardEducationalLevel,
    CollectionCardKeyword,
} from '@models/collections/collection-card';
import { getValuesWithinLimits } from '../../shared/shared.module';
import { Observable, Subscription } from 'rxjs';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '@models/koodisto-proxy/language';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-collection-card',
    templateUrl: './collection-card.component.html',
    styleUrls: ['./collection-card.component.scss'],
})
export class CollectionCardComponent implements OnInit, OnDestroy {
    @Input() collection: CollectionCard;
    @Input() lang: string;

    educationalLevels: CollectionCardEducationalLevel[];
    keywords: CollectionCardKeyword[];
    languageSubscription: Subscription;
    languages$: Observable<Language[]>;

    constructor(private translate: TranslateService, private koodistoSvc: KoodistoProxyService) {}

    ngOnInit(): void {
        this.languages$ = this.koodistoSvc.languages$
            .asObservable()
            .pipe(
                map((languages: Language[]) =>
                    languages.filter((language: Language) =>
                        this.collection.languages.includes(language.key.toLowerCase()),
                    ),
                ),
            );
        this.educationalLevels = getValuesWithinLimits(this.collection.educationalLevels, 'value');
        this.keywords = getValuesWithinLimits(this.collection.keywords, 'value');
    }

    ngOnDestroy(): void {
        this.languageSubscription.unsubscribe();
    }
}
