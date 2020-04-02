import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EducationalMaterialForm } from '@models/educational-material-form';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { Subscription } from 'rxjs';
import { AccessibilityFeature } from '@models/koodisto-proxy/accessibility-feature';
import { AccessibilityHazard } from '@models/koodisto-proxy/accessibility-hazard';
import { addCustomItem, addPrerequisites } from '../../../../shared/shared.module';

@Component({
  selector: 'app-tabs-edit-extended-details',
  templateUrl: './edit-extended-details.component.html',
  styleUrls: ['./edit-extended-details.component.scss']
})
export class EditExtendedDetailsComponent implements OnInit, OnDestroy {
  @Input() material: EducationalMaterialForm;
  @Input() materialId: number;
  @Input() tabId: number;
  form: FormGroup;
  submitted = false;
  accessibilityFeatureSubscription: Subscription;
  accessibilityFeatures: AccessibilityFeature[];
  accessibilityHazardSubscription: Subscription;
  accessibilityHazards: AccessibilityHazard[];
  addCustomItem = addCustomItem;
  addPrerequisites = addPrerequisites;
  @Output() abortEdit = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private koodistoSvc: KoodistoProxyService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      accessibilityFeatures: this.fb.control(null),
      accessibilityHazards: this.fb.control(null),
      typicalAgeRange: this.fb.group({
        typicalAgeRangeMin: this.fb.control(null, [ Validators.min(0) ]),
        typicalAgeRangeMax: this.fb.control(null, [ Validators.min(0) ]),
      }),
      timeRequired: this.fb.control(null),
      publisher: this.fb.control(null),
      expires: this.fb.control(null),
      prerequisites: this.fb.control(null),
    });

    this.translate.onLangChange.subscribe(() => {
      this.koodistoSvc.updateAccessibilityFeatures();
      this.koodistoSvc.updateAccessibilityHazards();
    });

    if (sessionStorage.getItem(environment.editMaterial) === null) {
      this.form.patchValue(this.material);
    } else {
      this.form.patchValue(JSON.parse(sessionStorage.getItem(environment.editMaterial)));
    }

    if (this.expiresCtrl.value) {
      this.expiresCtrl.setValue(new Date(this.expiresCtrl.value));
    }

    // accessibility features
    this.accessibilityFeatureSubscription = this.koodistoSvc.accessibilityFeatures$
      .subscribe((features: AccessibilityFeature[]) => {
        this.accessibilityFeatures = features;
      });
    this.koodistoSvc.updateAccessibilityFeatures();

    // accessibility hazards
    this.accessibilityHazardSubscription = this.koodistoSvc.accessibilityHazards$
      .subscribe((hazards: AccessibilityHazard[]) => {
        this.accessibilityHazards = hazards;
      });
    this.koodistoSvc.updateAccessibilityHazards();
  }

  ngOnDestroy(): void {
    this.accessibilityFeatureSubscription.unsubscribe();
    this.accessibilityHazardSubscription.unsubscribe();
  }

  get typicalAgeRangeMinCtrl(): FormControl {
    return this.form.get('typicalAgeRange.typicalAgeRangeMin') as FormControl;
  }

  get typicalAgeRangeMaxCtrl(): FormControl {
    return this.form.get('typicalAgeRange.typicalAgeRangeMax') as FormControl;
  }

  get expiresCtrl(): FormControl {
    return this.form.get('expires') as FormControl;
  }

  /**
   * Runs on submit. If form is valid and dirty, changed material is saved on sessionStorage.
   * If form is valid, redirects user to the next tab.
   */
  onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      if (this.form.dirty) {
        const changedMaterial: EducationalMaterialForm = sessionStorage.getItem(environment.editMaterial) !== null
          ? JSON.parse(sessionStorage.getItem(environment.editMaterial))
          : this.material;

        changedMaterial.accessibilityFeatures = this.form.get('accessibilityFeatures').value;
        changedMaterial.accessibilityHazards = this.form.get('accessibilityHazards').value;
        changedMaterial.typicalAgeRange = this.form.get('typicalAgeRange').value;
        changedMaterial.timeRequired = this.form.get('timeRequired').value;
        changedMaterial.publisher = this.form.get('publisher').value;
        changedMaterial.expires = this.expiresCtrl.value;
        changedMaterial.prerequisites = this.form.get('prerequisites').value;

        sessionStorage.setItem(environment.editMaterial, JSON.stringify(changedMaterial));
      }

      this.router.navigate(['/muokkaa-oppimateriaalia', this.materialId, this.tabId + 1]);
    }
  }

  /**
   * Emits EventEmitter indicating user wants to abort.
   */
  abort(): void {
    this.abortEdit.emit();
  }

  /**
   * Redirects user to previous tab.
   */
  previous(): void {
    this.router.navigate(['/muokkaa-oppimateriaalia', this.materialId, this.tabId - 1]);
  }
}
