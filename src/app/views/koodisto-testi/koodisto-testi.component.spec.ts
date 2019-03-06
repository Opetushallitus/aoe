import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KoodistoTestiComponent } from './koodisto-testi.component';

describe('KoodistoTestiComponent', () => {
  let component: KoodistoTestiComponent;
  let fixture: ComponentFixture<KoodistoTestiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KoodistoTestiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KoodistoTestiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
