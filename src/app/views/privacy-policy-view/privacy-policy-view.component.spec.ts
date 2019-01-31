import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyPolicyViewComponent } from './privacy-policy-view.component';

describe('PrivacyPolicyViewComponent', () => {
  let component: PrivacyPolicyViewComponent;
  let fixture: ComponentFixture<PrivacyPolicyViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivacyPolicyViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyPolicyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
