import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CollectionService } from '@services/collection.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BackendService } from '@services/backend.service';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { Collection } from '@models/collections/collection';

@Component({
  selector: 'app-collection-view',
  templateUrl: './collection-view.component.html',
  styleUrls: ['./collection-view.component.scss']
})
export class CollectionViewComponent implements OnInit, OnDestroy {
  lang: string = this.translate.currentLang;
  collectionId: string;
  collectionSubscription: Subscription;
  collection: Collection;
  collectionMaterials = new Map();
  materialLanguages = new Map();
  detailsExpanded = false;
  materialDetails = new Map();
  iframeSrc: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private collectionSvc: CollectionService,
    private backendSvc: BackendService,
    private titleSvc: Title,
  ) { }

  ngOnInit(): void {
    this.collectionId = this.route.snapshot.paramMap.get('collectionId');

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.collectionSubscription = this.collectionSvc.collection$.subscribe((collection: Collection) => {
      this.collection = collection;

      if (JSON.stringify(collection) === '{}') {
        return this.router.navigate(['/etusivu']);
      }

      this.setTitle();
      this.setMaterialDetails(collection.educationalMaterials);
    });
    this.collectionSvc.updateCollection(this.collectionId);

    this.iframeSrc = `${environment.frontendUrl}/#/kokoelma/materiaali/`;
  }

  ngOnDestroy(): void {
    this.collectionSubscription.unsubscribe();
  }

  setTitle(): void {
    this.titleSvc.setTitle(`${this.collection.name} ${environment.title}`);
  }

  /**
   * Sets material details.
   * @param materials
   */
  setMaterialDetails(materials): void {
    materials.forEach((material) => {
      this.materialDetails.set(material.id, {
        name: material.name,
        authors: material.author,
      });
    });
  }
}
