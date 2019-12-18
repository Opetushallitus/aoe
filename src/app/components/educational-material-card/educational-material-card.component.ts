import { Component, Input, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { EducationalMaterialList } from '../../models/educational-material-list';

@Component({
  selector: 'app-educational-material-card',
  templateUrl: './educational-material-card.component.html',
})
export class EducationalMaterialCardComponent implements OnInit {
  @Input() educationalMaterial: EducationalMaterialList;
  lang: string = this.translate.currentLang;

  materialName: string;
  description: string;
  /*keywords: object[];
  educationalLevels: object[];*/

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
    /*this.keywords = this.getValuesWithinLimits(this.educationalMaterial.keywords);
    this.educationalLevels = this.getValuesWithinLimits(this.educationalMaterial.educationalLevels);*/
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

  /*getValuesWithinLimits(input: object[]): object[] {
    const charLimit = 60;
    let usedChars = 0;
    const values = [];

    input.forEach(row => {
      if (usedChars + row['value'].length <= charLimit) {
        values.push(row);
        usedChars += row['value'].length;
      }
    });

    if (values.length < input.length) {
      values.push({ value: `+${input.length - values.length}` });
    }

    return values;
  }*/
}
