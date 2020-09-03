import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionsViewComponent } from './collections-view.component';

describe('CollectionsViewComponent', () => {
  let component: CollectionsViewComponent;
  let fixture: ComponentFixture<CollectionsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
