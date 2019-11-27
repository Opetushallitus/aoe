import { Component, OnDestroy, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { LegacyEducationalMaterial } from '../../models/demo/educational-material';
import { EDUCATIONALMATERIALS } from '../../mocks/demo/educational-materials.mock';

@Component({
  selector: 'app-educational-materials-list',
  templateUrl: './educational-materials-list.component.html',
})
export class EducationalMaterialsListComponent implements OnInit, OnDestroy {
  public educationalMaterials: LegacyEducationalMaterial[];
  private subscription: Subscription;

  constructor(private translate: TranslateService) { }

  ngOnInit(): void {
    // Initialize education materials
    this.educationalMaterials = EDUCATIONALMATERIALS.filter(m => m.inLanguage.id.toLocaleLowerCase() === this.translate.currentLang);

    // Subscribe to language changes
    this.subscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.educationalMaterials = EDUCATIONALMATERIALS.filter(m => m.inLanguage.id.toLocaleLowerCase() === event.lang);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
