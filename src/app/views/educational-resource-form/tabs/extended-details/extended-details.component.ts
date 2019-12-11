import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { environment } from '../../../../../environments/environment';
import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';
import { addCustomItem } from '../../../../shared/shared.module';
import { AlignmentObjectExtended } from '../../../../models/alignment-object-extended';
import { AccessibilityFeature } from '../../../../models/koodisto-proxy/accessibility-feature';
import { AccessibilityHazard } from '../../../../models/koodisto-proxy/accessibility-hazard';
import { koodistoSources } from '../../../../constants/koodisto-sources';

@Component({
  selector: 'app-tabs-extended-details',
  templateUrl: './extended-details.component.html',
})
export class ExtendedDetailsComponent implements OnInit, OnDestroy {
  private savedDataKey = environment.newERLSKey;
  private fileUploadLSKey = environment.fileUploadLSKey;
  lang: string = this.translate.currentLang;
  savedData: any;

  accessibilityFeatureSubscription: Subscription;
  accessibilityFeatures: AccessibilityFeature[];
  accessibilityHazardSubscription: Subscription;
  accessibilityHazards: AccessibilityHazard[];

  extendedDetailsForm: FormGroup;

  private alignmentObjects: AlignmentObjectExtended[] = [];

  addCustomItem = addCustomItem;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.koodistoProxySvc.updateAccessibilityFeatures();
      this.koodistoProxySvc.updateAccessibilityHazards();
    });

    this.savedData = JSON.parse(sessionStorage.getItem(this.savedDataKey));

    this.extendedDetailsForm = this.fb.group({
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
        this.extendedDetailsForm.get('accessibilityFeatures').setValue(this.savedData.accessibilityFeatures);
      }

      if (this.savedData.accessibilityHazards) {
        this.extendedDetailsForm.get('accessibilityHazards').setValue(this.savedData.accessibilityHazards);
      }

      if (this.savedData.typicalAgeRange) {
        this.extendedDetailsForm.get('typicalAgeRange').setValue(this.savedData.typicalAgeRange);
      }

      if (this.savedData.timeRequired) {
        this.extendedDetailsForm.get('timeRequired').setValue(this.savedData.timeRequired);
      }

      if (this.savedData.publisher) {
        this.extendedDetailsForm.get('publisher').setValue(this.savedData.publisher);
      }

      if (this.savedData.expires) {
        this.extendedDetailsForm.get('expires').setValue(new Date(this.savedData.expires));
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
    this.accessibilityFeatureSubscription.unsubscribe();
    this.accessibilityHazardSubscription.unsubscribe();
  }

  get prerequisites(): FormControl {
    return this.extendedDetailsForm.get('prerequisites') as FormControl;
  }

  addPrerequisites(value): AlignmentObjectExtended {
    return {
      key: value.replace(/[\W_]+/g, ''),
      source: koodistoSources.prerequisites,
      alignmentType: 'requires',
      targetName: value,
    };
  }

  onSubmit() {
    if (this.extendedDetailsForm.valid) {
      if (this.prerequisites.value) {
        this.prerequisites.value.forEach((prerequisite: AlignmentObjectExtended) => {
          this.alignmentObjects.push(prerequisite);
        });
      }

      const data = Object.assign(
        {},
        JSON.parse(sessionStorage.getItem(this.savedDataKey)),
        this.extendedDetailsForm.value,
        { alignmentObjects: this.alignmentObjects }
      );

      // save data to session storage
      sessionStorage.setItem(this.savedDataKey, JSON.stringify(data));

      this.router.navigate(['/lisaa-oppimateriaali', 5]);
    }
  }

  resetForm() {
    // reset form values
    this.extendedDetailsForm.reset();

    // clear data from session storage
    sessionStorage.removeItem(this.savedDataKey);
    sessionStorage.removeItem(this.fileUploadLSKey);
  }

  previousTab() {
    this.router.navigate(['/lisaa-oppimateriaali', 3]);
  }
}
