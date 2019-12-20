import { Component, Input, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { EducationalMaterialList } from '../../models/educational-material-list';
import { Keyword } from '../../models/keyword';
import { EducationalLevel } from '../../models/educational-level';

@Component({
  selector: 'app-educational-material-card',
  templateUrl: './educational-material-card.component.html',
})
export class EducationalMaterialCardComponent implements OnInit {
  @Input() educationalMaterial: EducationalMaterialList;
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

      this.updateMaterialName();
      this.updateDescription();
    });

    this.updateMaterialName();
    this.updateDescription();

    // @todo: redo this with api data
    this.keywords = this.getValuesWithinLimits(this.educationalMaterial.keywords);
    this.educationalLevels = this.getValuesWithinLimits(this.educationalMaterial.educationalLevels);
  }

  updateMaterialName(): void {
    if (this.educationalMaterial.name.find(n => n.language === this.lang).materialname !== '') {
      this.materialName = this.educationalMaterial.name.find(n => n.language === this.lang).materialname;
    } else {
      this.materialName = this.educationalMaterial.name.find(n => n.language === 'fi').materialname;
    }
  }

  updateDescription(): void {
    if (this.educationalMaterial.description.find(d => d.language === this.lang).description !== '') {
      this.description = this.educationalMaterial.description.find(d => d.language === this.lang).description;
    } else {
      this.description = this.educationalMaterial.description.find(d => d.language === 'fi').description;
    }
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
