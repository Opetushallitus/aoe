import { TestBed, async, inject } from '@angular/core/testing';

import { AcceptanceGuard } from './acceptance.guard';

describe('AcceptanceGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AcceptanceGuard]
    });
  });

  it('should ...', inject([AcceptanceGuard], (guard: AcceptanceGuard) => {
    expect(guard).toBeTruthy();
  }));
});
