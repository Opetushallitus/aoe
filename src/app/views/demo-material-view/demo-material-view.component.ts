import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { DEMOMATERIALS } from '../../mocks/demo-materials.mock';
import { LEARNINGRESOURCETYPEICONS } from '../../mocks/learning-resource-type-icons.mock';
import { DemoMaterial } from '../../models/demo-material';
import { LearningResourceTypeIcon } from '../../models/learning-resource-type-icon';

@Component({
  selector: 'app-demo-material-view',
  templateUrl: './demo-material-view.component.html',
})
export class DemoMaterialViewComponent implements OnInit {

  demoMaterials: DemoMaterial[] = DEMOMATERIALS;
  learningResourceTypeIcons: LearningResourceTypeIcon[] = LEARNINGRESOURCETYPEICONS;
  demoMaterial: DemoMaterial;

  constructor(
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.demoMaterial = this.demoMaterials.find(m => m.id === +params['id']);
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
