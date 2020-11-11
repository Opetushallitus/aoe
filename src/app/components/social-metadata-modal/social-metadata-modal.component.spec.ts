import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialMetadataModalComponent } from './social-metadata-modal.component';

describe('SocialMetadataModalComponent', () => {
  let component: SocialMetadataModalComponent;
  let fixture: ComponentFixture<SocialMetadataModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SocialMetadataModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialMetadataModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
