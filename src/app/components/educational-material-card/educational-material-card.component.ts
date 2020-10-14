import { Component, Input, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { EducationalMaterialCard } from '@models/educational-material-card';
import { getValuesWithinLimits } from '../../shared/shared.module';
import { Keyword } from '@models/keyword';
import { EducationalLevel } from '@models/educational-level';

@Component({
  selector: 'app-educational-material-card',
  templateUrl: './educational-material-card.component.html',
  styleUrls: ['./educational-material-card.component.scss']
})
export class EducationalMaterialCardComponent implements OnInit {
  @Input() educationalMaterial: EducationalMaterialCard;
  lang: string = this.translate.currentLang;

  materialName: string;
  description: string;
  keywords: Keyword[];
  educationalLevels: EducationalLevel[];

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
