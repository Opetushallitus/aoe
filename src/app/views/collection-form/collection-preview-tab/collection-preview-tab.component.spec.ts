import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CollectionPreviewTabComponent } from './collection-preview-tab.component';

describe('CollectionPreviewTabComponent', () => {
  let component: CollectionPreviewTabComponent;
  let fixture: ComponentFixture<CollectionPreviewTabComponent>;

  beforeEach(waitForAsync(() => {
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
