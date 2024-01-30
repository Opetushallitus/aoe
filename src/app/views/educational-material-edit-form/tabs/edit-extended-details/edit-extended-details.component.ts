import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { addCustomItem, addPrerequisites, textInputValidator } from '../../../../shared/shared.module';
import { validatorParams } from '@constants/validator-params';
import { KoodistoService } from '@services/koodisto.service';
import { EducationalMaterialForm } from '@models/educational-material-form';
import { AccessibilityFeature } from '@models/koodisto/accessibility-feature';
import { AccessibilityHazard } from '@models/koodisto/accessibility-hazard';
import { TitlesMaterialFormTabs } from '@models/translations/titles';
import { MaterialService } from '@services/material.service';

@Component({
  selector: 'app-tabs-edit-extended-details',
  templateUrl: './edit-extended-details.component.html',
  styleUrls: ['./edit-extended-details.component.scss'],
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
  accessibilityLink: string = `${environment.frontendUrl}/#/saavutettavuus/`;

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private translate: TranslateService,
    private koodistoSvc: KoodistoService,
    private router: Router,
    private titleSvc: Title,
  ) {}

  ngOnInit(): void {
    this.setTitle();

    this.form = this.fb.group({
      accessibilityFeatures: this.fb.control(null),
      accessibilityHazards: this.fb.control(null),
      typicalAgeRange: this.fb.group({
        typicalAgeRangeMin: this.fb.control(null, [
          Validators.min(validatorParams.ageRange.min.min),
          Validators.pattern(validatorParams.ageRange.min.pattern),
          Validators.maxLength(validatorParams.ageRange.min.maxLength),
        ]),
        typicalAgeRangeMax: this.fb.control(null, [
          Validators.min(validatorParams.ageRange.max.min),
          Validators.pattern(validatorParams.ageRange.max.pattern),
          Validators.maxLength(validatorParams.ageRange.max.maxLength),
        ]),
      }),
      timeRequired: this.fb.control(null, [
        Validators.maxLength(validatorParams.timeRequired.maxLength),
        textInputValidator(),
      ]),
      publisher: this.fb.control(null),
      expires: this.fb.control(null),
      prerequisites: this.fb.control(null),
    });

    this.translate.onLangChange.subscribe(() => {
      this.setTitle();

      this.koodistoSvc.updateAccessibilityFeatures();
      this.koodistoSvc.updateAccessibilityHazards();
    });

    if (!this.materialService) {
      this.form.patchValue(this.material);
    } else {
      this.form.patchValue(this.materialService.getEducationalMaterialEditForm());
    }

    if (this.expiresCtrl.value) {
      this.expiresCtrl.setValue(new Date(this.expiresCtrl.value));
    }

    // accessibility features
    this.accessibilityFeatureSubscription = this.koodistoSvc.accessibilityFeatures$.subscribe(
      (features: AccessibilityFeature[]) => {
        this.accessibilityFeatures = features;
      },
    );
    this.koodistoSvc.updateAccessibilityFeatures();

    // accessibility hazards
    this.accessibilityHazardSubscription = this.koodistoSvc.accessibilityHazards$.subscribe(
      (hazards: AccessibilityHazard[]) => {
        this.accessibilityHazards = hazards;
      },
    );
    this.koodistoSvc.updateAccessibilityHazards();
  }

  ngOnDestroy(): void {
    this.accessibilityFeatureSubscription.unsubscribe();
    this.accessibilityHazardSubscription.unsubscribe();
  }

  setTitle(): void {
    this.translate.get('titles.editMaterial').subscribe((translations: TitlesMaterialFormTabs) => {
      this.titleSvc.setTitle(`${translations.main}: ${translations.extended} ${environment.title}`);
    });
  }

  get typicalAgeRangeMinCtrl(): FormControl {
    return this.form.get('typicalAgeRange.typicalAgeRangeMin') as FormControl;
  }

  get typicalAgeRangeMaxCtrl(): FormControl {
    return this.form.get('typicalAgeRange.typicalAgeRangeMax') as FormControl;
  }

  get timeRequiredCtrl(): FormControl {
    return this.form.get('timeRequired') as FormControl;
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
        const changedMaterial: EducationalMaterialForm =
          this.materialService.getEducationalMaterialEditForm() || this.material;
        const typicalAgeRange = this.form.get('typicalAgeRange').value;
        if (typicalAgeRange.typicalAgeRangeMin === '') typicalAgeRange.typicalAgeRangeMin = null;
        if (typicalAgeRange.typicalAgeRangeMax === '') typicalAgeRange.typicalAgeRangeMax = null;
        changedMaterial.accessibilityFeatures = this.form.get('accessibilityFeatures').value;
        changedMaterial.accessibilityHazards = this.form.get('accessibilityHazards').value;
        changedMaterial.typicalAgeRange = typicalAgeRange;
        changedMaterial.timeRequired = this.form.get('timeRequired').value;
        changedMaterial.publisher = this.form.get('publisher').value;
        changedMaterial.expires = this.expiresCtrl.value;
        changedMaterial.prerequisites = this.form.get('prerequisites').value;
        this.materialService.setEducationalMaterialEditForm(changedMaterial);
      }
      void this.router.navigate(['/muokkaa-oppimateriaalia', this.materialId, this.tabId + 1]);
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
    void this.router.navigate(['/muokkaa-oppimateriaalia', this.materialId, this.tabId - 1]);
  }
}
