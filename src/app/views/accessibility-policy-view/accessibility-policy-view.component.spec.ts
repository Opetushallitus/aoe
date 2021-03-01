import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccessibilityPolicyViewComponent } from './accessibility-policy-view.component';

describe('AccessibilityPolicyViewComponent', () => {
  let component: AccessibilityPolicyViewComponent;
  let fixture: ComponentFixture<AccessibilityPolicyViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessibilityPolicyViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessibilityPolicyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
