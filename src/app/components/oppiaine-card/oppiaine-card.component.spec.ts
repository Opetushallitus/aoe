import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OppiaineCardComponent } from './oppiaine-card.component';

describe('OppiaineCardComponent', () => {
  let component: OppiaineCardComponent;
  let fixture: ComponentFixture<OppiaineCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OppiaineCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OppiaineCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
