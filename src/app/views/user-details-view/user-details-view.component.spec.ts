import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserDetailsViewComponent } from './user-details-view.component';

describe('UserDetailsViewComponent', () => {
  let component: UserDetailsViewComponent;
  let fixture: ComponentFixture<UserDetailsViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserDetailsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDetailsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
