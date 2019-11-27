import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { EducationalMaterial } from '../../models/educational-material';
import { Material } from '../../models/material';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'app-demo-material-view',
  templateUrl: './educational-material-view.component.html',
})
export class EducationalMaterialViewComponent implements OnInit, OnDestroy {
  lang: string = this.translate.currentLang;
  educationalMaterial: EducationalMaterial;
  private routeSubscription: Subscription;
  previewMaterial: Material;
  specialId: number;

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
      this.specialId = +params['specialId'];

      this.backendSvc.getMaterial(+params['specialId']).subscribe(data => {
        this.educationalMaterial = data;
        this.previewMaterial = this.educationalMaterial.materials[0];
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
