import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CollectionSearchResultComponent } from './collection-search-result.component';

describe('CollectionSearchResultComponent', () => {
  let component: CollectionSearchResultComponent;
  let fixture: ComponentFixture<CollectionSearchResultComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionSearchResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
