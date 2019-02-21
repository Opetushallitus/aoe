import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

import { LearningResourceTypeService } from '../../services/learning-resource-type.service';

import { EducationalMaterial } from '../../models/demo/educational-material';
import { EDUCATIONALMATERIALS } from '../../mocks/demo/educational-materials.mock';
import { Material } from '../../models/demo/material';

@Component({
  selector: 'app-demo-material-view',
  templateUrl: './educational-material-view.component.html',
})
export class EducationalMaterialViewComponent implements OnInit, OnDestroy {
  private educationalMaterials: EducationalMaterial[] = EDUCATIONALMATERIALS;
  public educationalMaterial: EducationalMaterial;
  private subscription: Subscription;
  public mainMaterial: Material;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    public lrtSvc: LearningResourceTypeService
  ) { }

  ngOnInit(): void {
    this.subscription = this.route.params.subscribe(params => {
      this.educationalMaterial = this.educationalMaterials.find(m => m.id === +params['id']);

      this.mainMaterial = this.educationalMaterial.materials.shift();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  goBack(): void {
    this.location.back();
  }
}
