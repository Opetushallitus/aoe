import { TestBed } from '@angular/core/testing';

import { DisableFormsGuard } from './disable-forms.guard';

describe('DisableFormsGuard', () => {
  let guard: DisableFormsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(DisableFormsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
