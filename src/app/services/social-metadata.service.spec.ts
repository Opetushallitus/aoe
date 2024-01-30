import { TestBed } from '@angular/core/testing';

import { SocialMetadataService } from './social-metadata.service';

describe('SocialMetadataService', () => {
  let service: SocialMetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocialMetadataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
