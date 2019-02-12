import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationalMaterialsListComponent } from './educational-materials-list.component';

describe('EducationalMaterialsListComponent', () => {
  let component: EducationalMaterialsListComponent;
  let fixture: ComponentFixture<EducationalMaterialsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EducationalMaterialsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EducationalMaterialsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
