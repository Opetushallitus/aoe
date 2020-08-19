import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionMaterialPreviewComponent } from './collection-material-preview.component';

describe('CollectionMaterialPreviewComponent', () => {
  let component: CollectionMaterialPreviewComponent;
  let fixture: ComponentFixture<CollectionMaterialPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionMaterialPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionMaterialPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
