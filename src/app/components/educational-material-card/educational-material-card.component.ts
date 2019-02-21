import { Component, Input } from '@angular/core';

import { EducationalMaterial } from '../../models/demo/educational-material';
import { LearningResourceTypeService } from '../../services/learning-resource-type.service';

@Component({
  selector: 'app-educational-material-card',
  templateUrl: './educational-material-card.component.html',
})
export class EducationalMaterialCardComponent {
  @Input()
  educationalMaterial: EducationalMaterial;

  constructor(private lrtSvc: LearningResourceTypeService) { }
}
