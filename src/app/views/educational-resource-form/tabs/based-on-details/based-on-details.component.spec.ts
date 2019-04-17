import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasedOnDetailsComponent } from './based-on-details.component';

describe('BasedOnDetailsComponent', () => {
  let component: BasedOnDetailsComponent;
  let fixture: ComponentFixture<BasedOnDetailsComponent>;

  beforeEach(async(() => {
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
