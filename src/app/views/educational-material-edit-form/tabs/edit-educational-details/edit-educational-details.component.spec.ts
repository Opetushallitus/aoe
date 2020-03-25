import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEducationalDetailsComponent } from './edit-educational-details.component';

describe('EditEducationalDetailsComponent', () => {
  let component: EditEducationalDetailsComponent;
  let fixture: ComponentFixture<EditEducationalDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditEducationalDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditEducationalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
