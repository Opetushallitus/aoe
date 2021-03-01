import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditExtendedDetailsComponent } from './edit-extended-details.component';

describe('EditExtendedDetailsComponent', () => {
  let component: EditExtendedDetailsComponent;
  let fixture: ComponentFixture<EditExtendedDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditExtendedDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditExtendedDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
