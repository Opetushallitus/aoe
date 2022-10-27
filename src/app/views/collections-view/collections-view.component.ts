import { Component, OnDestroy, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { CollectionCard } from '@models/collections/collection-card';
import { CollectionService } from '@services/collection.service';
import { KoodistoService } from '@services/koodisto.service';

@Component({
    selector: 'app-collections-view',
    templateUrl: './collections-view.component.html',
    styleUrls: ['./collections-view.component.scss'],
})
export class CollectionsViewComponent implements OnInit, OnDestroy {
    lang: string = this.translate.currentLang;
    recentCollectionSubscription: Subscription;
    recentCollections: CollectionCard[];

    constructor(
        private koodistoSvc: KoodistoService,
        private translate: TranslateService,
        private titleSvc: Title,
        private collectionSvc: CollectionService,
    ) {}

    ngOnInit(): void {
        this.setTitle();

        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            // Update available service languages and save them to the state management (languages$).
            // For the direct URL navigation, update available languages once for each routed parent component.
            this.koodistoSvc.updateLanguages();
            this.lang = event.lang;
            this.setTitle();
        });
        this.recentCollectionSubscription = this.collectionSvc.recentCollections$.subscribe(
            (collections: CollectionCard[]) => {
                this.recentCollections = collections;
            },
        );
        this.collectionSvc.updateRecentCollections();
    }

    ngOnDestroy(): void {
        this.recentCollectionSubscription.unsubscribe();
    }

    setTitle(): void {
        this.translate.get('titles.collections').subscribe((title: string) => {
            this.titleSvc.setTitle(`${title} ${environment.title}`);
        });
    }
}
