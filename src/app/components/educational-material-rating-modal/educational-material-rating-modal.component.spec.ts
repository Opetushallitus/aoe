import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationalMaterialRatingModalComponent } from './educational-material-rating-modal.component';

describe('EducationalMaterialRatingModalComponent', () => {
  let component: EducationalMaterialRatingModalComponent;
  let fixture: ComponentFixture<EducationalMaterialRatingModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EducationalMaterialRatingModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EducationalMaterialRatingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
