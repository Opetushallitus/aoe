import { Component, OnInit } from '@angular/core';

import { EducationalMaterial } from '../../models/demo/educational-material';
import { EDUCATIONALMATERIALS } from '../../mocks/demo/educational-materials.mock';
import { getUser } from '../../shared/shared.module';

@Component({
  selector: 'app-user-materials-view',
  templateUrl: './user-materials-view.component.html',
})
export class UserMaterialsViewComponent implements OnInit {
  public educationalMaterials: EducationalMaterial[];

  constructor() { }

  ngOnInit(): void {
    this.educationalMaterials = EDUCATIONALMATERIALS.filter(m => m.username === getUser().username);
  }
}
