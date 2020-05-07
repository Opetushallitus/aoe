import { Component, OnDestroy, OnInit } from '@angular/core';

import { AuthService } from '@services/auth.service';
import { BackendService } from '@services/backend.service';
import { EducationalMaterialCard } from '@models/educational-material-card';
import { Subscription } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-materials-view',
  templateUrl: './user-materials-view.component.html',
  styleUrls: ['./user-materials-view.component.scss']
})
export class UserMaterialsViewComponent implements OnInit, OnDestroy {
  lang: string = this.translate.currentLang;
  publishedMaterialSubscription: Subscription;
  publishedMaterials: EducationalMaterialCard[];
  unpublishedMaterialSubscription: Subscription;
  unpublishedMaterials: EducationalMaterialCard[];

  constructor(
    private authSvc: AuthService,
    private backendSvc: BackendService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.publishedMaterialSubscription = this.backendSvc.publishedUserMaterials$
      .subscribe((materials: EducationalMaterialCard[]) => {
        this.publishedMaterials = materials;
      });

    this.unpublishedMaterialSubscription = this.backendSvc.unpublishedUserMaterials$
      .subscribe((materials: EducationalMaterialCard[]) => {
        this.unpublishedMaterials = materials;
      });

    this.backendSvc.updateUserMaterialList();
  }

  ngOnDestroy(): void {
    this.publishedMaterialSubscription.unsubscribe();
    this.unpublishedMaterialSubscription.unsubscribe();
  }
}
