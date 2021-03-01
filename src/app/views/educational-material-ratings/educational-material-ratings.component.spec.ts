import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EducationalMaterialRatingsComponent } from './educational-material-ratings.component';

describe('EducationalMaterialRatingsComponent', () => {
  let component: EducationalMaterialRatingsComponent;
  let fixture: ComponentFixture<EducationalMaterialRatingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EducationalMaterialRatingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EducationalMaterialRatingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
