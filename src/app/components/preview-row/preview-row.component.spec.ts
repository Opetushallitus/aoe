import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewRowComponent } from './preview-row.component';

describe('PreviewRowComponent', () => {
  let component: PreviewRowComponent;
  let fixture: ComponentFixture<PreviewRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewRowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
