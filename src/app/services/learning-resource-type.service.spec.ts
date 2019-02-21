import { TestBed } from '@angular/core/testing';

import { LearningResourceTypeService } from './learning-resource-type.service';

describe('LearningResourceTypeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LearningResourceTypeService = TestBed.get(LearningResourceTypeService);
    expect(service).toBeTruthy();
  });
});
