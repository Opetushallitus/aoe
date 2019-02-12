import { Component, OnDestroy, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { EducationalMaterial } from '../../models/demo/educational-material';
import { EDUCATIONALMATERIALS as EducationalMaterialsFI } from '../../mocks/demo/educational-materials-fi.mock';
import { EDUCATIONALMATERIALS as EducationalMaterialsEN } from '../../mocks/demo/educational-materials-en.mock';

@Component({
  selector: 'app-educational-materials-list',
  templateUrl: './educational-materials-list.component.html',
})
export class EducationalMaterialsListComponent implements OnInit, OnDestroy {
  public educationalMaterials: EducationalMaterial[];
  private materials = {
    'fi': EducationalMaterialsFI,
    'en': EducationalMaterialsEN,
  };
  private subscription: Subscription;

  constructor(private translate: TranslateService) { }

  ngOnInit(): void {
    // Initialize education materials
    this.educationalMaterials = this.materials[this.translate.currentLang];

    // Subscribe to language changes
    this.subscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.educationalMaterials = this.materials[event.lang];
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
