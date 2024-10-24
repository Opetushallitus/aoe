import { TestBed } from '@angular/core/testing';

import { RatingsService } from './ratings.service';

describe('RatingsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RatingsService = TestBed.inject(RatingsService);
    expect(service).toBeTruthy();
  });
});
