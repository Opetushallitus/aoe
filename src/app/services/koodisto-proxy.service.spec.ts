import { TestBed } from '@angular/core/testing';

import { KoodistoProxyService } from './koodisto-proxy.service';

describe('KoodistoProxyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KoodistoProxyService = TestBed.inject(KoodistoProxyService);
    expect(service).toBeTruthy();
  });
});
