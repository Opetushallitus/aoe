import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { EDUCATIONALMATERIALS } from '../../mocks/demo/educational-materials-fi.mock';
import { LEARNINGRESOURCETYPEICONS } from '../../mocks/learning-resource-type-icons.mock';

import { EducationalMaterial } from '../../models/demo/educational-material';
import { LearningResourceTypeIcon } from '../../models/learning-resource-type-icon';

@Component({
  selector: 'app-demo-material-view',
  templateUrl: './educational-material-view.component.html',
})
export class EducationalMaterialViewComponent implements OnInit {

  educationalMaterials: EducationalMaterial[] = EDUCATIONALMATERIALS;
  educationalMaterial: EducationalMaterial;
  learningResourceTypeIcons: LearningResourceTypeIcon[] = LEARNINGRESOURCETYPEICONS;

  constructor(
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.educationalMaterial = this.educationalMaterials.find(m => m.id === +params['id']);
    });
  }

  goBack(): void {
    this.location.back();
  }

  getLearningResourceTypeIcon(learningResourceType: string): string {
    const learningResourceTypeIcon = this.learningResourceTypeIcons.find(lrti => lrti.type === learningResourceType);

    return learningResourceTypeIcon.icon;
  }

}
