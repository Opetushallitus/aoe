import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { LegacyEducationalMaterial } from '../../models/demo/educational-material';
import { EDUCATIONALMATERIALS } from '../../mocks/demo/educational-materials.mock';

@Component({
  selector: 'app-user-materials-view',
  templateUrl: './user-materials-view.component.html',
})
export class UserMaterialsViewComponent implements OnInit {
  public educationalMaterials: LegacyEducationalMaterial[];

  constructor(private authSvc: AuthService) { }

  ngOnInit(): void {
    this.educationalMaterials = EDUCATIONALMATERIALS.filter(m => m.username === this.authSvc.getUser().username);
  }
}
