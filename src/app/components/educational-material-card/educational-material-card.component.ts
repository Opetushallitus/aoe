import { Component, Input, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { EducationalMaterialCard } from '@models/educational-material-card';
import { getValuesWithinLimits } from '../../shared/shared.module';

@Component({
  selector: 'app-educational-material-card',
  templateUrl: './educational-material-card.component.html',
})
export class EducationalMaterialCardComponent implements OnInit {
  @Input() educationalMaterial: EducationalMaterialCard;
  lang: string = this.translate.currentLang;

  materialName: string;
  description: string;
  keywords: any[];
  educationalLevels: any[];

  constructor(
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.keywords = getValuesWithinLimits(this.educationalMaterial.keywords, 'value');
    this.educationalLevels = getValuesWithinLimits(this.educationalMaterial.educationalLevels, 'value');
  }
}
