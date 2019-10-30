import { Component, Input, OnInit } from '@angular/core';

import { EducationalMaterialList } from '../../models/educational-material-list';

@Component({
  selector: 'app-educational-material-card',
  templateUrl: './educational-material-card.component.html',
})
export class EducationalMaterialCardComponent implements OnInit {
  @Input() educationalMaterial: EducationalMaterialList;
  /*keywords: object[];
  educationalLevels: object[];*/

  constructor() { }

  ngOnInit(): void {
    // @todo: redo this with api data
    /*this.keywords = this.getValuesWithinLimits(this.educationalMaterial.keywords);
    this.educationalLevels = this.getValuesWithinLimits(this.educationalMaterial.educationalLevels);*/
  }

  /*private getValuesWithinLimits(input: object[]): object[] {
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
