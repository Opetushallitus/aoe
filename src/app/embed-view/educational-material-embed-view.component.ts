import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';

import { MaterialService } from './material.service';
import { Material } from '@models/material';
import { EducationalMaterial } from '@models/educational-material';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { License } from '@models/koodisto-proxy/license';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { getLanguage, setLanguage } from '../shared/shared.module';

@Component({
  selector: 'app-educational-material-embed-view',
  templateUrl: './educational-material-embed-view.component.html',
  styleUrls: ['./educational-material-embed-view.component.scss'],
})
export class EducationalMaterialEmbedViewComponent implements OnInit, OnDestroy {
  materialSubscription: Subscription;
  materialId: number;
  lang: string;
  educationalMaterial: EducationalMaterial;
  previewMaterial: Material;
  materials: Material[];
  materialName: string;
  licenses: License[];
  licenseSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private materialSvc: MaterialService,
    private koodistoSvc: KoodistoProxyService,
    @Inject(DOCUMENT) doc: Document,
    private translate: TranslateService,
    private renderer: Renderer2,
  ) {
    translate.addLangs(['fi', 'en', 'sv']);
    translate.setDefaultLang('fi');

    const lang = getLanguage();

    if (lang === null) {
      const browserLang = translate.getBrowserLang();

      setLanguage(browserLang.match(/fi|en|sv/) ? browserLang : 'fi');
      translate.use(browserLang);
    } else {
      translate.use(lang);
    }

    translate.onLangChange.subscribe((event: LangChangeEvent) => {
      renderer.setAttribute(doc.documentElement, 'lang', event.lang);
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.materialId = +params.get('materialId');
      this.lang = params.get('lang').toLowerCase();

      this.materialSvc.updateMaterial(this.materialId);
      this.licenseSubscription = this.koodistoSvc.licenses$.subscribe((licenses: License[]) => {
        this.licenses = licenses;
      });
      this.koodistoSvc.updateLicenses();
    });

    this.materialSubscription = this.materialSvc.material$.subscribe((material: EducationalMaterial) => {
      this.educationalMaterial = material;

      if (this.educationalMaterial.materials.filter((m) => m.language === this.lang).length > 0) {
        this.materials = this.educationalMaterial.materials.filter((m) => m.language === this.lang);
      } else {
        this.materials = this.educationalMaterial.materials.filter((m) => m.language === 'fi');
      }

      if (this.materials.length > 0) {
        this.previewMaterial = this.materials[0];
      }

      this.updateMaterialName();
    });
  }

  updateMaterialName(): void {
    if (this.educationalMaterial.name.find((n) => n.language === this.lang).materialname !== '') {
      this.materialName = this.educationalMaterial.name.find((n) => n.language === this.lang).materialname;
    } else {
      this.materialName = this.educationalMaterial.name.find((n) => n.language === 'fi').materialname;
    }
  }

  getLicense(key: string): License {
    return this.licenses?.find((license: License) => license.key === key);
  }

  ngOnDestroy(): void {
    this.materialSubscription.unsubscribe();
  }

  setPreviewMaterial(material: Material): void {
    this.previewMaterial = material;
  }
}
