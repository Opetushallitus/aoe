import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { BackendService } from '../../services/backend.service';
import { Material } from '../../models/material';
import { EducationalMaterial } from '../../models/educational-material';

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

  constructor(
    private route: ActivatedRoute,
    private backendSvc: BackendService,
  ) { }

  ngOnInit(): void {
    this.materialId = +this.route.snapshot.paramMap.get('materialId');
    this.lang = this.route.snapshot.paramMap.get('lang').toLowerCase();

    this.materialSubscription = this.backendSvc.getMaterial(this.materialId).subscribe(data => {
      this.educationalMaterial = data;

      if (this.educationalMaterial.materials.filter(m => m.language === this.lang).length > 0) {
        this.materials = this.educationalMaterial.materials.filter(m => m.language === this.lang);
      } else {
        this.materials = this.educationalMaterial.materials.filter(m => m.language === 'fi');
      }

      if (this.materials.length > 0) {
        this.previewMaterial = this.materials[0];
      }
    });
  }

  ngOnDestroy(): void {
    this.materialSubscription.unsubscribe();
  }

  setPreviewMaterial(material: Material): void {
    this.previewMaterial = material;
  }
}
