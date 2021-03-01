import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditBasedOnDetailsComponent } from './edit-based-on-details.component';

describe('EditBasedOnDetailsComponent', () => {
  let component: EditBasedOnDetailsComponent;
  let fixture: ComponentFixture<EditBasedOnDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBasedOnDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBasedOnDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
