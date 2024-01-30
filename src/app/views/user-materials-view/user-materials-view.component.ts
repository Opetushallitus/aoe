import { Component, OnDestroy, OnInit } from '@angular/core';

import { AuthService } from '@services/auth.service';
import { MaterialService } from '@services/material.service';
import { EducationalMaterialCard } from '@models/educational-material-card';
import { Subscription } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { UserCollection } from '@models/collections/user-collection';
import { CollectionService } from '@services/collection.service';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-materials-view',
  templateUrl: './user-materials-view.component.html',
  styleUrls: ['./user-materials-view.component.scss'],
})
export class UserMaterialsViewComponent implements OnInit, OnDestroy {
  lang: string = this.translate.currentLang;
  publishedMaterialSubscription: Subscription;
  publishedMaterials: EducationalMaterialCard[];
  unpublishedMaterialSubscription: Subscription;
  unpublishedMaterials: EducationalMaterialCard[];
  privateCollectionSubscription: Subscription;
  privateCollections: UserCollection[];
  publicCollectionSubscription: Subscription;
  publicCollections: UserCollection[];

  constructor(
    private authService: AuthService,
    private materialSvc: MaterialService,
    private translate: TranslateService,
    private collectionSvc: CollectionService,
    private titleSvc: Title,
  ) {}

  ngOnInit(): void {
    this.setTitle();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.setTitle();
    });

    this.publishedMaterialSubscription = this.materialSvc.publishedUserMaterials$$.subscribe(
      (materials: EducationalMaterialCard[]) => {
        this.publishedMaterials = materials;
      },
    );

    this.unpublishedMaterialSubscription = this.materialSvc.unpublishedUserMaterials$$.subscribe(
      (materials: EducationalMaterialCard[]) => {
        this.unpublishedMaterials = materials;
      },
    );

    this.materialSvc.updateUserMaterialList();

    this.privateCollectionSubscription = this.collectionSvc.privateUserCollections$.subscribe(
      (collections: UserCollection[]) => {
        this.privateCollections = collections;
      },
    );

    this.publicCollectionSubscription = this.collectionSvc.publicUserCollections$.subscribe(
      (collections: UserCollection[]) => {
        this.publicCollections = collections;
      },
    );

    this.collectionSvc.updateUserCollections();
  }

  ngOnDestroy(): void {
    this.publishedMaterialSubscription.unsubscribe();
    this.unpublishedMaterialSubscription.unsubscribe();
    this.privateCollectionSubscription.unsubscribe();
    this.publicCollectionSubscription.unsubscribe();
  }

  setTitle(): void {
    this.translate.get('titles.userMaterials').subscribe((title: string) => {
      this.titleSvc.setTitle(`${title} ${environment.title}`);
    });
  }

  expireAlertType(date: Date): string {
    return new Date(date) < new Date() ? 'expired' : 'expires';
  }
}
