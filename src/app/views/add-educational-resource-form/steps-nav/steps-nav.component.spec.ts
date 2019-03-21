import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepsNavComponent } from './steps-nav.component';

describe('StepsNavComponent', () => {
  let component: StepsNavComponent;
  let fixture: ComponentFixture<StepsNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepsNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepsNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
