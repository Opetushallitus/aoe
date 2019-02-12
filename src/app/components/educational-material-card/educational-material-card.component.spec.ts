import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationalMaterialCardComponent } from './educational-material-card.component';

describe('EducationalMaterialCardComponent', () => {
  let component: EducationalMaterialCardComponent;
  let fixture: ComponentFixture<EducationalMaterialCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EducationalMaterialCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EducationalMaterialCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
