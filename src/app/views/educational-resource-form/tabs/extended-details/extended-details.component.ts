import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { KeyValue } from '@angular/common';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { environment } from '../../../../../environments/environment';
import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';
import { getLocalStorageData, addCustomItem } from '../../../../shared/shared.module';
import { AlignmentObjectExtended } from '../../../../models/alignment-object-extended';

@Component({
  selector: 'app-tabs-extended-details',
  templateUrl: './extended-details.component.html',
})
export class ExtendedDetailsComponent implements OnInit {
  private localStorageKey = environment.newERLSKey;
  private fileUploadLSKey = environment.fileUploadLSKey;
  private lang: string = this.translate.currentLang;
  private savedData: any;

  public accessibilityFeatures$: KeyValue<string, string>[];
  public accessibilityHazards$: KeyValue<string, string>[];

  public extendedDetailsForm: FormGroup;

  private alignmentObjects: AlignmentObjectExtended[] = [];

  public addCustomItem = addCustomItem;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.savedData = getLocalStorageData(this.localStorageKey);

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

    this.koodistoProxySvc.getData('saavutettavuudentukitoiminnot', this.lang).subscribe(data => {
      this.accessibilityFeatures$ = data;
    });

    this.koodistoProxySvc.getData('saavutettavuudenesteet', this.lang).subscribe(data => {
      this.accessibilityHazards$ = data;
    });

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
          .filter(alignmentObject => alignmentObject.source === 'prerequisites');

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

  get prerequisites(): FormControl {
    return this.extendedDetailsForm.get('prerequisites') as FormControl;
  }

  public addPrerequisites(value): AlignmentObjectExtended {
    return {
      key: value.replace(/[\W_]+/g, ''),
      source: 'prerequisites',
      alignmentType: 'requires',
      targetName: value,
    };
  }

  public onSubmit() {
    if (this.extendedDetailsForm.valid) {
      if (this.prerequisites.value) {
        this.prerequisites.value.forEach((prerequisite: AlignmentObjectExtended) => {
          this.alignmentObjects.push(prerequisite);
        });
      }

      const data = Object.assign(
        {},
        getLocalStorageData(this.localStorageKey),
        this.extendedDetailsForm.value,
        { alignmentObjects: this.alignmentObjects }
      );

      // save data to local storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));

      this.router.navigate(['/lisaa-oppimateriaali', 5]);
    }
  }

  // @todo: some kind of confirmation
  public resetForm() {
    // reset form values
    this.extendedDetailsForm.reset();

    // clear data from local storage
    localStorage.removeItem(this.localStorageKey);
    localStorage.removeItem(this.fileUploadLSKey);
  }

  public previousTab() {
    this.router.navigate(['/lisaa-oppimateriaali', 3]);
  }
}
