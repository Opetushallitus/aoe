import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TermsOfUseViewComponent } from './terms-of-use-view.component';

describe('TermsOfUseViewComponent', () => {
  let component: TermsOfUseViewComponent;
  let fixture: ComponentFixture<TermsOfUseViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TermsOfUseViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsOfUseViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
