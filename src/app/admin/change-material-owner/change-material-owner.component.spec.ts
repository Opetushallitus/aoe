import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeMaterialOwnerComponent } from './change-material-owner.component';

describe('ChangeMaterialOwnerComponent', () => {
  let component: ChangeMaterialOwnerComponent;
  let fixture: ComponentFixture<ChangeMaterialOwnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeMaterialOwnerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeMaterialOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
