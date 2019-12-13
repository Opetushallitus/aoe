import { Component, OnInit } from '@angular/core';

import { EducationalMaterialList } from '../../models/educational-material-list';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'app-recent-materials',
  templateUrl: './recent-materials.component.html',
})
export class RecentMaterialsComponent implements OnInit {
  materials: EducationalMaterialList[];

  constructor(
    private backendSvc: BackendService,
  ) { }

  ngOnInit() {
    this.backendSvc.getRecentMaterialList().subscribe(data => {
      this.materials = data;
    });
  }
}
