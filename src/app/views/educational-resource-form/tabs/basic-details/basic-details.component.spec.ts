import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BasicDetailsComponent } from './basic-details.component';

describe('BasicDetailsComponent', () => {
  let component: BasicDetailsComponent;
  let fixture: ComponentFixture<BasicDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BasicDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
