import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationalMaterialEmbedViewComponent } from './educational-material-embed-view.component';

describe('EducationalMaterialEmbedViewComponent', () => {
  let component: EducationalMaterialEmbedViewComponent;
  let fixture: ComponentFixture<EducationalMaterialEmbedViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EducationalMaterialEmbedViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EducationalMaterialEmbedViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
