import { TestBed } from '@angular/core/testing';

import { KoodistoTestiService } from './koodisto-testi.service';

describe('KoodistoTestiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KoodistoTestiService = TestBed.get(KoodistoTestiService);
    expect(service).toBeTruthy();
  });
});
