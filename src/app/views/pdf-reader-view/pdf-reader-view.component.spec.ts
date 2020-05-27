import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfReaderViewComponent } from './pdf-reader-view.component';

describe('PdfReaderViewComponent', () => {
  let component: PdfReaderViewComponent;
  let fixture: ComponentFixture<PdfReaderViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PdfReaderViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfReaderViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
