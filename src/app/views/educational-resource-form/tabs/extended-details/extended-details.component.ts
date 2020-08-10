import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { environment } from '../../../../../environments/environment';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { addCustomItem, addPrerequisites, textInputValidator } from '../../../../shared/shared.module';
import { AlignmentObjectExtended } from '@models/alignment-object-extended';
import { AccessibilityFeature } from '@models/koodisto-proxy/accessibility-feature';
import { AccessibilityHazard } from '@models/koodisto-proxy/accessibility-hazard';
import { koodistoSources } from '../../../../constants/koodisto-sources';
import { Title } from '@angular/platform-browser';
import { validatorParams } from '../../../../constants/validator-params';

@Component({
  selector: 'app-tabs-extended-details',
  templateUrl: './extended-details.component.html',
  styleUrls: ['./extended-details.component.scss']
})
export class ExtendedDetailsComponent implements OnInit, OnDestroy {
  lang: string = this.translate.currentLang;
  savedData: any;

  accessibilityFeatureSubscription: Subscription;
  accessibilityFeatures: AccessibilityFeature[];
  accessibilityHazardSubscription: Subscription;
  accessibilityHazards: AccessibilityHazard[];

  form: FormGroup;
  submitted = false;

  private alignmentObjects: AlignmentObjectExtended[] = [];

  addCustomItem = addCustomItem;
  addPrerequisites = addPrerequisites;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
    private titleSvc: Title,
  ) { }

  ngOnInit() {
    this.setTitle();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.setTitle();

      this.koodistoProxySvc.updateAccessibilityFeatures();
      this.koodistoProxySvc.updateAccessibilityHazards();
    });

    this.savedData = JSON.parse(sessionStorage.getItem(environment.newERLSKey));

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

    this.accessibilityFeatureSubscription = this.koodistoProxySvc.accessibilityFeatures$
      .subscribe((accessibilityFeatures: AccessibilityFeature[]) => {
        this.accessibilityFeatures = accessibilityFeatures;
      });
    this.koodistoProxySvc.updateAccessibilityFeatures();

    this.accessibilityHazardSubscription = this.koodistoProxySvc.accessibilityHazards$
      .subscribe((accessibilityHazards: AccessibilityHazard[]) => {
        this.accessibilityHazards = accessibilityHazards;
      });
    this.koodistoProxySvc.updateAccessibilityHazards();

    if (this.savedData) {
      if (this.savedData.accessibilityFeatures) {
        this.accessibilityFeaturesCtrl.setValue(this.savedData.accessibilityFeatures);
      }

      if (this.savedData.accessibilityHazards) {
        this.accessibilityHazardsCtrl.setValue(this.savedData.accessibilityHazards);
      }

      if (this.savedData.typicalAgeRange) {
        this.form.get('typicalAgeRange').setValue(this.savedData.typicalAgeRange);
      }

      if (this.savedData.timeRequired) {
        this.form.get('timeRequired').setValue(this.savedData.timeRequired);
      }

      if (this.savedData.publisher) {
        this.publisherCtrl.setValue(this.savedData.publisher);
      }

      if (this.savedData.expires) {
        this.form.get('expires').setValue(new Date(this.savedData.expires));
      }

      if (this.savedData.alignmentObjects) {
        this.alignmentObjects = this.savedData.alignmentObjects;

        // filter prerequisites
        const prerequisites = this.alignmentObjects
          .filter(alignmentObject => alignmentObject.source === koodistoSources.prerequisites);

        // set filtered prerequisites as form control value
        this.prerequisites.setValue(prerequisites);

        // remove prerequisites from alignmentObjects
        prerequisites.forEach((prerequisite: AlignmentObjectExtended) => {
          const index = this.alignmentObjects.indexOf(prerequisite);
          this.alignmentObjects.splice(index, 1);
        });
      }
    }
  }

  ngOnDestroy(): void {
    // save data if its valid, dirty and not submitted
    if (this.submitted === false && this.form.dirty && this.form.valid) {
      this.saveData();
    }

    this.accessibilityFeatureSubscription.unsubscribe();
    this.accessibilityHazardSubscription.unsubscribe();
  }

  setTitle(): void {
    this.translate.get('titles.addMaterial').subscribe((translations: any) => {
      this.titleSvc.setTitle(`${translations.main}: ${translations.extended} ${environment.title}`);
    });
  }

  get accessibilityFeaturesCtrl(): FormControl {
    return this.form.get('accessibilityFeatures') as FormControl;
  }

  get accessibilityHazardsCtrl(): FormControl {
    return this.form.get('accessibilityHazards') as FormControl;
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

  get publisherCtrl(): FormControl {
    return this.form.get('publisher') as FormControl;
  }

  get prerequisites(): FormControl {
    return this.form.get('prerequisites') as FormControl;
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.valid) {
      if (this.form.dirty) {
        this.saveData();
      }

      this.router.navigate(['/lisaa-oppimateriaali', 5]);
    }
  }

  saveData(): void {
    if (this.prerequisites.value) {
      this.prerequisites.value.forEach((prerequisite: AlignmentObjectExtended) => {
        this.alignmentObjects.push(prerequisite);
      });
    }

    if (this.accessibilityFeaturesCtrl.value && this.accessibilityFeaturesCtrl.value.length === 0) {
      this.accessibilityFeaturesCtrl.setValue(null);
    }

    if (this.accessibilityHazardsCtrl.value && this.accessibilityHazardsCtrl.value.length === 0) {
      this.accessibilityHazardsCtrl.setValue(null);
    }

    if (this.typicalAgeRangeMinCtrl.value === '') {
      this.typicalAgeRangeMinCtrl.setValue(null);
    }

    if (this.typicalAgeRangeMaxCtrl.value === '') {
      this.typicalAgeRangeMaxCtrl.setValue(null);
    }

    if (this.publisherCtrl.value && this.publisherCtrl.value.length === 0) {
      this.publisherCtrl.setValue(null);
    }

    const data = Object.assign(
      {},
      JSON.parse(sessionStorage.getItem(environment.newERLSKey)),
      this.form.value,
      { alignmentObjects: this.alignmentObjects }
    );

    // save data to session storage
    sessionStorage.setItem(environment.newERLSKey, JSON.stringify(data));
  }

  resetForm() {
    // reset form values
    this.form.reset();

    // clear data from session storage
    sessionStorage.removeItem(environment.newERLSKey);
    sessionStorage.removeItem(environment.fileUploadLSKey);

    this.router.navigateByUrl('/');
  }

  previousTab() {
    this.router.navigate(['/lisaa-oppimateriaali', 3]);
  }
}
