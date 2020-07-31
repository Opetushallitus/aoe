import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionPreviewTabComponent } from './collection-preview-tab.component';

describe('CollectionPreviewTabComponent', () => {
  let component: CollectionPreviewTabComponent;
  let fixture: ComponentFixture<CollectionPreviewTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionPreviewTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionPreviewTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
