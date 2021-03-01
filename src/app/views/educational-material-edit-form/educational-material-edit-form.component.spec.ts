import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EducationalMaterialEditFormComponent } from './educational-material-edit-form.component';

describe('EducationalMaterialEditFormComponent', () => {
  let component: EducationalMaterialEditFormComponent;
  let fixture: ComponentFixture<EducationalMaterialEditFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EducationalMaterialEditFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EducationalMaterialEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
