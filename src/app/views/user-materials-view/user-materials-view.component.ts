import { Component, OnDestroy, OnInit } from '@angular/core';

import { AuthService } from '@services/auth.service';
import { BackendService } from '@services/backend.service';
import { EducationalMaterialList } from '@models/educational-material-list';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-materials-view',
  templateUrl: './user-materials-view.component.html',
})
export class UserMaterialsViewComponent implements OnInit, OnDestroy {
  publishedMaterialSubscription: Subscription;
  publishedMaterials: EducationalMaterialList[];
  unpublishedMaterialSubscription: Subscription;
  unpublishedMaterials: EducationalMaterialList[];

  constructor(
    private authSvc: AuthService,
    private backendSvc: BackendService,
  ) { }

  ngOnInit(): void {
    this.publishedMaterialSubscription = this.backendSvc.publishedUserMaterials$
      .subscribe((materials: EducationalMaterialList[]) => {
        this.publishedMaterials = materials;
      });

    this.unpublishedMaterialSubscription = this.backendSvc.unpublishedUserMaterials$
      .subscribe((materials: EducationalMaterialList[]) => {
        this.unpublishedMaterials = materials;
      });

    this.backendSvc.updateUserMaterialList();
  }

  ngOnDestroy(): void {
    this.publishedMaterialSubscription.unsubscribe();
    this.unpublishedMaterialSubscription.unsubscribe();
  }
}
