import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CollectionService } from '@services/collection.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Material } from '@models/material';
import { MaterialService } from '@services/material.service';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { Collection } from '@models/collections/collection';
import { Language } from '@models/koodisto-proxy/language';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { CollectionFormMaterialAndHeading } from '@models/collections/collection-form';

@Component({
  selector: 'app-collection-view',
  templateUrl: './collection-view.component.html',
  styleUrls: ['./collection-view.component.scss'],
})
export class CollectionViewComponent implements OnInit, OnDestroy {
  lang: string = this.translate.currentLang;
  collectionId: string;
  collectionSubscription: Subscription;
  collection: Collection;
  languageSubscription: Subscription;
  languages: Language[];
  materialsLoading = new Map();
  collectionMaterials = new Map();
  previewMaterials = new Map();
  materialLanguages = new Map();
  selectedLanguages = new Map();
  detailsExpanded = false;
  materialDetails = new Map();
  headingLevels = new Map();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private collectionSvc: CollectionService,
    private materialSvc: MaterialService,
    private titleSvc: Title,
    private koodistoSvc: KoodistoProxyService,
  ) {}

  ngOnInit(): void {
    this.collectionId = this.route.snapshot.paramMap.get('collectionId');

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      for (const [key, value] of this.materialLanguages.entries()) {
        if (value.includes(event.lang.toLowerCase())) {
          this.setSelectedLanguage(key, event.lang.toLowerCase());
        }
      }
    });

    this.collectionSubscription = this.collectionSvc.collection$.subscribe((collection: Collection) => {
      this.collection = collection;

      if (JSON.stringify(collection) === '{}') {
        return this.router.navigate(['/etusivu']);
      }

      this.setTitle();
      this.setMaterialDetails(collection.educationalMaterials);
      this.setHeadingLevels(collection.materialsAndHeadings);

      this.languageSubscription = this.koodistoSvc.languages$.subscribe((languages: Language[]) => {
        this.languages = languages.filter((lang: Language) => this.collection.languages.includes(lang.key.toLowerCase()));
      });
      this.koodistoSvc.updateLanguages();

      collection.educationalMaterials.forEach((collectionMaterial) => {
        // set loading true
        this.materialsLoading.set(collectionMaterial.id, true);

        this.materialSvc.getCollectionMaterials(collectionMaterial.id).subscribe((materials: Material[]) => {
          // set collection materials
          this.collectionMaterials.set(collectionMaterial.id, materials);

          // set loading false
          this.materialsLoading.set(collectionMaterial.id, false);

          // set material languages
          const materialLanguages = [...new Set(materials.map((material: Material) => material.language.toLowerCase()))];
          this.materialLanguages.set(collectionMaterial.id, materialLanguages);

          // set default language (1. UI lang, 2. FI, 3. first language in array)
          this.selectedLanguages.set(
            collectionMaterial.id,
            materialLanguages.find((lang: string) => lang === this.lang)
              ? materialLanguages.find((lang: string) => lang === this.lang)
              : materialLanguages.find((lang: string) => lang === 'fi')
              ? materialLanguages.find((lang: string) => lang === 'fi')
              : materialLanguages[0],
          );

          // set preview material
          this.setPreviewMaterial(
            collectionMaterial.id,
            materials.find((material: Material) => material.language === this.selectedLanguages.get(collectionMaterial.id)),
          );
        });
      });
    });
    this.collectionSvc.updateCollection(this.collectionId);
  }

  ngOnDestroy(): void {
    this.collectionSubscription.unsubscribe();
    // this.languageSubscription.unsubscribe();
  }

  setTitle(): void {
    this.titleSvc.setTitle(`${this.collection.name} ${environment.title}`);
  }

  /**
   * Sets preview material to selected material.
   * @param {string} materialId
   * @param {Material} material
   */
  setPreviewMaterial(materialId: string, material: Material): void {
    this.previewMaterials.set(materialId, material);
  }

  /**
   * Sets selected language to preview language. Updates preview material to match selected language.
   * @param {string} materialId
   * @param {string} language
   */
  setSelectedLanguage(materialId: string, language: string): void {
    // set selected language
    this.selectedLanguages.set(materialId, language);

    // set preview material to first material that matches selected language
    this.setPreviewMaterial(
      materialId,
      this.collectionMaterials.get(materialId).find((m) => m.language === language),
    );
  }

  /**
   * Sets material details.
   * @param materials
   */
  setMaterialDetails(materials: any): void {
    materials.forEach((material: any) => {
      this.materialDetails.set(material.id, {
        name: material.name,
        authors: material.author,
      });
    });
  }

  setHeadingLevels(materialsAndHeadings: CollectionFormMaterialAndHeading[]): void {
    materialsAndHeadings.forEach((materialOrHeading: CollectionFormMaterialAndHeading, idx: number) => {
      // skip headings, they are always h2
      if (materialOrHeading.id) {
        if (materialsAndHeadings[idx - 1]?.heading || this.headingLevels.get(idx - 1) === 'h3') {
          this.headingLevels.set(idx, 'h3');
        } else {
          this.headingLevels.set(idx, 'h2');
        }
      }
    });
  }
}
