import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoMaterialViewComponent } from './demo-material-view.component';

describe('DemoMaterialViewComponent', () => {
  let component: DemoMaterialViewComponent;
  let fixture: ComponentFixture<DemoMaterialViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemoMaterialViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoMaterialViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
