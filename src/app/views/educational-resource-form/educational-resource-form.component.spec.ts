import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EducationalResourceFormComponent } from './educational-resource-form.component';

describe('EducationalResourceFormComponent', () => {
    let component: EducationalResourceFormComponent;
    let fixture: ComponentFixture<EducationalResourceFormComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [EducationalResourceFormComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(EducationalResourceFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
