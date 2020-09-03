import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionMaterialsTabComponent } from './collection-materials-tab.component';

describe('CollectionMaterialsTabComponent', () => {
  let component: CollectionMaterialsTabComponent;
  let fixture: ComponentFixture<CollectionMaterialsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionMaterialsTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionMaterialsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
