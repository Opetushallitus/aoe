import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationalMaterialViewComponent } from './educational-material-view.component';

describe('EducationalMaterialViewComponent', () => {
  let component: EducationalMaterialViewComponent;
  let fixture: ComponentFixture<EducationalMaterialViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EducationalMaterialViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EducationalMaterialViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
