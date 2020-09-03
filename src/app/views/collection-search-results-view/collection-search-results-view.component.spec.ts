import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionSearchResultsViewComponent } from './collection-search-results-view.component';

describe('CollectionSearchResultsViewComponent', () => {
  let component: CollectionSearchResultsViewComponent;
  let fixture: ComponentFixture<CollectionSearchResultsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionSearchResultsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionSearchResultsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
