import { Component } from '@angular/core';

import { EducationalMaterial } from '../../models/demo/educational-material';
import { EDUCATIONALMATERIALS } from '../../mocks/demo/educational-materials-fi.mock';

@Component({
  selector: 'app-educational-materials-list',
  templateUrl: './educational-materials-list.component.html',
})
export class EducationalMaterialsListComponent {
  educationalMaterials: EducationalMaterial[] = EDUCATIONALMATERIALS;
}
