import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LogoutViewComponent } from './logout-view.component';

describe('LogoutViewComponent', () => {
  let component: LogoutViewComponent;
  let fixture: ComponentFixture<LogoutViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LogoutViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoutViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
