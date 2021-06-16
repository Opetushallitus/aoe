import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BasedOnDetailsComponent } from './based-on-details.component';

describe('BasedOnDetailsComponent', () => {
  let component: BasedOnDetailsComponent;
  let fixture: ComponentFixture<BasedOnDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BasedOnDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasedOnDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
