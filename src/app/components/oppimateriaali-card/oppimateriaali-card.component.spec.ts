import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OppimateriaaliCardComponent } from './oppimateriaali-card.component';

describe('OppimateriaaliCardComponent', () => {
  let component: OppimateriaaliCardComponent;
  let fixture: ComponentFixture<OppimateriaaliCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OppimateriaaliCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OppimateriaaliCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
