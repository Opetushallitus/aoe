import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CollectionEducationalDetailsTabComponent } from './collection-educational-details-tab.component';

describe('CollectionEducationalDetailsTabComponent', () => {
  let component: CollectionEducationalDetailsTabComponent;
  let fixture: ComponentFixture<CollectionEducationalDetailsTabComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CollectionEducationalDetailsTabComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionEducationalDetailsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
