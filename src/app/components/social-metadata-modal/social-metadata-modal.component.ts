import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { KeyValue } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { SocialMetadataService } from '@services/social-metadata.service';
import { SocialMetadata } from '@models/social-metadata/social-metadata';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { AccessibilityFeature } from '@models/koodisto-proxy/accessibility-feature';
import { AccessibilityHazard } from '@models/koodisto-proxy/accessibility-hazard';
import { EducationalLevel } from '@models/koodisto-proxy/educational-level';

@Component({
  selector: 'app-social-metadata-modal',
  templateUrl: './social-metadata-modal.component.html',
  styleUrls: ['./social-metadata-modal.component.scss']
})
export class SocialMetadataModalComponent implements OnInit, OnDestroy {
  materialId: number;
  form: FormGroup;
  keywordSubscription: Subscription;
  keywords: KeyValue<string, string>[];
  accessibilityFeatureSubscription: Subscription;
  accessibilityFeatures: AccessibilityFeature[];
  accessibilityHazardSubscription: Subscription;
  accessibilityHazards: AccessibilityHazard[];
  educationalLevelSubscription: Subscription;
  educationalLevels: EducationalLevel[];
  userSocialMetadataSubscription: Subscription;

  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private translate: TranslateService,
    private socialMetadataSvc: SocialMetadataService,
    private koodistoSvc: KoodistoProxyService,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      keywords: this.fb.control(null),
      accessibilityFeatures: this.fb.control(null),
      accessibilityHazards: this.fb.control(null),
      educationalLevels: this.fb.control(null),
    });

    this.translate.onLangChange.subscribe(() => {
      this.koodistoSvc.updateKeywords();
      this.koodistoSvc.updateAccessibilityFeatures();
      this.koodistoSvc.updateAccessibilityHazards();
      this.koodistoSvc.updateEducationalLevels();
    });

    // keywords
    this.keywordSubscription = this.koodistoSvc.keywords$
      .subscribe((keywords: KeyValue<string, string>[]) => {
        this.keywords = keywords;
      });
    this.koodistoSvc.updateKeywords();

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

    // educational levels
    this.educationalLevelSubscription = this.koodistoSvc.educationalLevels$
      .subscribe((levels: EducationalLevel[]) => {
        this.educationalLevels = levels;
      });
    this.koodistoSvc.updateEducationalLevels();

    this.userSocialMetadataSubscription = this.socialMetadataSvc.userSocialMetadata$.subscribe((metadata: SocialMetadata) => {
      this.form.patchValue(metadata);
    });
    this.socialMetadataSvc.updateUserSocialMetadata(this.materialId);
  }

  ngOnDestroy(): void {
    this.keywordSubscription.unsubscribe();
    this.accessibilityFeatureSubscription.unsubscribe();
    this.accessibilityHazardSubscription.unsubscribe();
    this.educationalLevelSubscription.unsubscribe();
    this.userSocialMetadataSubscription.unsubscribe();
  }

  onSubmit(): void {
    if (this.form.valid) {
      if (this.form.dirty) {
        this.socialMetadataSvc.putMaterialSocialMetadata(this.materialId, this.form.value).subscribe(
          () => {
            this.bsModalRef.hide();
            this.toastr.success(null, 'SUCCESS'); // @todo: replace with an actual title
          },
          (err: HttpErrorResponse) => this.toastr.error(null, err.error),
        );
      }

      this.bsModalRef.hide();
    }
  }
}
