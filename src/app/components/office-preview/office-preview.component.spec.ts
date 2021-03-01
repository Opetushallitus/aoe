import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OfficePreviewComponent } from './office-preview.component';

describe('OfficePreviewComponent', () => {
  let component: OfficePreviewComponent;
  let fixture: ComponentFixture<OfficePreviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OfficePreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
