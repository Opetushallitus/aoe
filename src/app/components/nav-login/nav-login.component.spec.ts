import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NavLoginComponent } from './nav-login.component';

describe('NavLoginComponent', () => {
  let component: NavLoginComponent;
  let fixture: ComponentFixture<NavLoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NavLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
