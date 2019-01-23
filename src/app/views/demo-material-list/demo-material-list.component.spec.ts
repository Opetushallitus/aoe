import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoMaterialListComponent } from './demo-material-list.component';

describe('DemoMaterialListComponent', () => {
  let component: DemoMaterialListComponent;
  let fixture: ComponentFixture<DemoMaterialListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemoMaterialListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoMaterialListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
