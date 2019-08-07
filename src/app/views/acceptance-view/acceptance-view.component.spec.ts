import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptanceViewComponent } from './acceptance-view.component';

describe('AcceptanceViewComponent', () => {
  let component: AcceptanceViewComponent;
  let fixture: ComponentFixture<AcceptanceViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcceptanceViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptanceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
