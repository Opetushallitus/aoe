import { Component, Input, OnInit } from '@angular/core';

import { EducationalMaterial } from '../../models/demo/educational-material';
import { LearningResourceTypeService } from '../../services/learning-resource-type.service';

@Component({
  selector: 'app-educational-material-card',
  templateUrl: './educational-material-card.component.html',
})
export class EducationalMaterialCardComponent implements OnInit {
  @Input() educationalMaterial: EducationalMaterial;
  public keywords: object[];
  public educationalLevels: object[];

  constructor(public lrtSvc: LearningResourceTypeService) { }

  ngOnInit(): void {
    this.keywords = this.getValuesWithinLimits(this.educationalMaterial.keywords);
    this.educationalLevels = this.getValuesWithinLimits(this.educationalMaterial.educationalLevel);
  }

  private getValuesWithinLimits(input: object[]): object[] {
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
  }
}
