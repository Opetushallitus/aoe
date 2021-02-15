import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivedMaterialComponent } from './archived-material.component';

describe('ArchivedMaterialViewComponent', () => {
  let component: ArchivedMaterialComponent;
  let fixture: ComponentFixture<ArchivedMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArchivedMaterialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchivedMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
