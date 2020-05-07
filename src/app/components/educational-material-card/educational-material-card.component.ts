import { Component, Input, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { EducationalMaterialCard } from '@models/educational-material-card';
import { Keyword } from '@models/keyword';
import { EducationalLevel } from '@models/educational-level';

@Component({
  selector: 'app-educational-material-card',
  templateUrl: './educational-material-card.component.html',
})
export class EducationalMaterialCardComponent implements OnInit {
  @Input() educationalMaterial: EducationalMaterialCard;
  lang: string = this.translate.currentLang;

  materialName: string;
  description: string;
  keywords: string[];
  educationalLevels: string[];

  constructor(
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    // @todo: redo this with api data
    this.keywords = this.getValuesWithinLimits(this.educationalMaterial.keywords);
    this.educationalLevels = this.getValuesWithinLimits(this.educationalMaterial.educationalLevels);
  }

  getValuesWithinLimits(input: Keyword[] | EducationalLevel[]): string[] {
    const charLimit = 30;
    let usedChars = 0;
    const values = [];

    input.forEach(row => {
      if (usedChars + row['value'].length <= charLimit) {
        values.push(row.value);
        usedChars += row['value'].length;
      }
    });

    if (values.length < input.length) {
      values.push(`+${input.length - values.length}`);
    }

    return values;
  }
}
