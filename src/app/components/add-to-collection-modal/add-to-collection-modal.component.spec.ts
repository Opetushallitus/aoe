import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToCollectionModalComponent } from './add-to-collection-modal.component';

describe('CollectionModalComponent', () => {
  let component: AddToCollectionModalComponent;
  let fixture: ComponentFixture<AddToCollectionModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddToCollectionModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddToCollectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
