import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CollectionMaterialsTabComponent } from './collection-materials-tab.component';

describe('CollectionMaterialsTabComponent', () => {
  let component: CollectionMaterialsTabComponent;
  let fixture: ComponentFixture<CollectionMaterialsTabComponent>;

  beforeEach(waitForAsync(() => {
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
