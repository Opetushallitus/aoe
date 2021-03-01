import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CollectionsViewComponent } from './collections-view.component';

describe('CollectionsViewComponent', () => {
  let component: CollectionsViewComponent;
  let fixture: ComponentFixture<CollectionsViewComponent>;

  beforeEach(waitForAsync(() => {
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
