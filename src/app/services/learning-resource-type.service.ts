import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { LearningResourceType } from '../models/demo/learning-resource-type';
import { LEARNINGRESOURCETYPES } from '../mocks/demo/learning-resource-types.mock';

@Injectable({
  providedIn: 'root'
})
export class LearningResourceTypeService {
  private learningResourceTypes: LearningResourceType[] = LEARNINGRESOURCETYPES;

  constructor(private translate: TranslateService) { }

  getLearningResourceTypeIcon(learningResourceTypeId: string): string {
    const learningResourceType = this.learningResourceTypes.find(lrt => lrt.id === learningResourceTypeId);

    return learningResourceType.icon;
  }

  getLearningResourceTypeValue(learningResourceTypeId: string): string {
    const learningResourceType = this.learningResourceTypes.find(lrt => lrt.id === learningResourceTypeId);

    return learningResourceType.value[this.translate.currentLang];
  }
}
