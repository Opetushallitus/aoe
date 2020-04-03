import { Component, OnInit } from '@angular/core';

import { AuthService } from '@services/auth.service';
import { BackendService } from '@services/backend.service';
import { EducationalMaterialList } from '@models/educational-material-list';

@Component({
  selector: 'app-user-materials-view',
  templateUrl: './user-materials-view.component.html',
})
export class UserMaterialsViewComponent implements OnInit {
  materials: EducationalMaterialList[];

  constructor(
    private authSvc: AuthService,
    private backendSvc: BackendService,
  ) { }

  ngOnInit(): void {
    this.backendSvc.getUserMaterialList().subscribe((materials: EducationalMaterialList[]) => {
      this.materials = materials;
    });
  }
}
