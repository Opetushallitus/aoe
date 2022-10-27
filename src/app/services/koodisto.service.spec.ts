import { TestBed } from '@angular/core/testing';

import { KoodistoService } from './koodisto.service';

describe('KoodistoProxyService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: KoodistoService = TestBed.inject(KoodistoService);
        expect(service).toBeTruthy();
    });
});
