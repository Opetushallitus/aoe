import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveMaterialComponent } from './remove-material.component';

describe('RemoveMaterialComponent', () => {
  let component: RemoveMaterialComponent;
  let fixture: ComponentFixture<RemoveMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemoveMaterialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
