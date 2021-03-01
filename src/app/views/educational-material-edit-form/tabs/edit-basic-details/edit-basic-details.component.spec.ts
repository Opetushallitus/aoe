import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditBasicDetailsComponent } from './edit-basic-details.component';

describe('EditBasicDetailsComponent', () => {
  let component: EditBasicDetailsComponent;
  let fixture: ComponentFixture<EditBasicDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBasicDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBasicDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
