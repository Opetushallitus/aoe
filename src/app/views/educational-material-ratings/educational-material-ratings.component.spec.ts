import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationalMaterialRatingsComponent } from './educational-material-ratings.component';

describe('EducationalMaterialRatingsComponent', () => {
  let component: EducationalMaterialRatingsComponent;
  let fixture: ComponentFixture<EducationalMaterialRatingsComponent>;

  beforeEach(async(() => {
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
