import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendedDetailsComponent } from './extended-details.component';

describe('ExtendedDetailsComponent', () => {
  let component: ExtendedDetailsComponent;
  let fixture: ComponentFixture<ExtendedDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtendedDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendedDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
