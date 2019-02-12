import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { EducationalMaterial } from '../../models/demo/educational-material';
import { materials } from '../../shared/shared.module';

@Component({
  selector: 'app-demo-material-view',
  templateUrl: './educational-material-view.component.html',
})
export class EducationalMaterialViewComponent implements OnInit, OnDestroy {
  private educationalMaterials: EducationalMaterial[];
  public educationalMaterial: EducationalMaterial;
  private subscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    // Initialize education materials
    this.educationalMaterials = materials[this.translate.currentLang];

    this.subscription = this.route.params.subscribe(params => {
      this.educationalMaterial = this.educationalMaterials.find(m => m.id === +params['id']);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  goBack(): void {
    this.location.back();
  }
}
