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

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private backendSvc: BackendService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.routeSubscription = this.route.params.subscribe(params => {
      this.backendSvc.getMaterial(+params['materialId']).subscribe(data => {
        this.educationalMaterial = data;
        this.previewMaterial = this.educationalMaterial.materials[0];
        this.downloadUrl = `${environment.backendUrl}/material/file/${params['materialId']}`;
      });
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  setPreviewMaterial(material: Material): void {
    this.previewMaterial = material;
  }
}
