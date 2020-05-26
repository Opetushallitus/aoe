import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Collection } from '@models/collections/collection';
import { CollectionService } from '@services/collection.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Material } from '@models/material';
import { BackendService } from '@services/backend.service';

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
  materialsLoading = new Map();
  collectionMaterials = new Map();
  previewMaterials = new Map();

  constructor(
    private route: ActivatedRoute,
    private translate: TranslateService,
    private collectionSvc: CollectionService,
    private backendSvc: BackendService,
  ) { }

  ngOnInit(): void {
    this.collectionId = this.route.snapshot.paramMap.get('collectionId');

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.collectionSubscription = this.collectionSvc.collection$.subscribe((collection: Collection) => {
      this.collection = collection;

      collection.educationalmaterials.forEach((material, i: number) => {
        // set loading true
        this.materialsLoading.set(material.id, true);

        this.backendSvc.getCollectionMaterials(material.id).subscribe((materials: Material[]) => {
          // set collection materials
          this.collectionMaterials.set(material.id, materials);

          // set preview material
          this.previewMaterials.set(material.id, materials[0]);

          // set loading false
          this.materialsLoading.set(material.id, false);
        });
      });
    });
    this.collectionSvc.updateCollection(this.collectionId);
  }

  ngOnDestroy(): void {
    this.collectionSubscription.unsubscribe();
  }

  setPreviewMaterial(materialId: string, material: Material): void {
    console.log(materialId);
    this.previewMaterials.set(materialId, material);
  }
}
