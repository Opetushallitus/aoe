import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { EducationalMaterial } from '../../models/educational-material';
import { Material } from '../../models/material';
import { BackendService } from '../../services/backend.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-demo-material-view',
  templateUrl: './educational-material-view.component.html',
})
export class EducationalMaterialViewComponent implements OnInit, OnDestroy {
  lang: string = this.translate.currentLang;
  educationalMaterial: EducationalMaterial;
  private routeSubscription: Subscription;
  previewMaterial: Material;
  downloadUrl: string;

  materialName: string;
  materials: Material[];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private backendSvc: BackendService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      if (this.educationalMaterial) {
        this.updateMaterialName();
        this.updateMaterials();
      }
    });

    this.routeSubscription = this.route.params.subscribe(params => {
      this.backendSvc.getMaterial(+params['materialId']).subscribe(data => {
        this.educationalMaterial = data;
        this.downloadUrl = `${environment.backendUrl}/material/file/${params['materialId']}`;

        this.updateMaterialName();
        this.updateMaterials();
      });
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  setPreviewMaterial(material: Material): void {
    this.previewMaterial = material;
  }

  updateMaterialName(): void {
    if (this.educationalMaterial.name.find(n => n.language === this.lang).materialname !== '') {
      this.materialName = this.educationalMaterial.name.find(n => n.language === this.lang).materialname;
    } else {
      this.materialName = this.educationalMaterial.name.find(n => n.language === 'fi').materialname;
    }
  }

  updateMaterials(): void {
    if (this.educationalMaterial.materials.filter(m => m.language === this.lang).length > 0) {
      this.materials = this.educationalMaterial.materials.filter(m => m.language === this.lang);
    } else {
      this.materials = this.educationalMaterial.materials.filter(m => m.language === 'fi');
    }

    if (this.materials.length > 0) {
      this.previewMaterial = this.materials[0];
    }
  }
}
