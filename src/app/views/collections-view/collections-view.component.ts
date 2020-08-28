import { Component, OnDestroy, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { CollectionCard } from '@models/collections/collection-card';
import { CollectionService } from '@services/collection.service';

@Component({
  selector: 'app-collections-view',
  templateUrl: './collections-view.component.html',
  styleUrls: ['./collections-view.component.scss']
})
export class CollectionsViewComponent implements OnInit, OnDestroy {
  lang: string = this.translate.currentLang;
  recentCollectionSubscription: Subscription;
  recentCollections: CollectionCard[];

  constructor(
    private translate: TranslateService,
    private titleSvc: Title,
    private collectionSvc: CollectionService,
  ) { }

  ngOnInit(): void {
    this.setTitle();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.setTitle();
    });

    this.recentCollectionSubscription = this.collectionSvc.recentCollections$.subscribe((collections: CollectionCard[]) => {
      this.recentCollections = collections;
    });
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
