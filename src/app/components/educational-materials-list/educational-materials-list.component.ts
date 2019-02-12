import { Component, OnDestroy, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { EducationalMaterial } from '../../models/demo/educational-material';
import { materials } from '../../shared/shared.module';

@Component({
  selector: 'app-educational-materials-list',
  templateUrl: './educational-materials-list.component.html',
})
export class EducationalMaterialsListComponent implements OnInit, OnDestroy {
  public educationalMaterials: EducationalMaterial[];
  private subscription: Subscription;

  constructor(private translate: TranslateService) { }

  ngOnInit(): void {
    // Initialize education materials
    this.educationalMaterials = materials[this.translate.currentLang];

    // Subscribe to language changes
    this.subscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.educationalMaterials = materials[event.lang];
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
