import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessibilityPolicyViewComponent } from './accessibility-policy-view.component';

describe('AccessibilityPolicyViewComponent', () => {
  let component: AccessibilityPolicyViewComponent;
  let fixture: ComponentFixture<AccessibilityPolicyViewComponent>;

  beforeEach(async(() => {
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
