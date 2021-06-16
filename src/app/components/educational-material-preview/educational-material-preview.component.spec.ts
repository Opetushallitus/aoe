import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EducationalMaterialPreviewComponent } from './educational-material-preview.component';

describe('EducationalMaterialPreviewComponent', () => {
  let component: EducationalMaterialPreviewComponent;
  let fixture: ComponentFixture<EducationalMaterialPreviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EducationalMaterialPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EducationalMaterialPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
