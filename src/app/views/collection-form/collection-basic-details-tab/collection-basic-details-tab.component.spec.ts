import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CollectionBasicDetailsTabComponent } from './collection-basic-details-tab.component';

describe('CollectionBasicDetailsTabComponent', () => {
  let component: CollectionBasicDetailsTabComponent;
  let fixture: ComponentFixture<CollectionBasicDetailsTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionBasicDetailsTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionBasicDetailsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
