import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { KeyValue } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { ImageCroppedEvent } from 'ngx-image-cropper';

import { environment } from '../../../../../environments/environment';
import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';
import { addCustomItem } from '../../../../shared/shared.module';
import { BackendService } from '../../../../services/backend.service';
import { UploadMessage } from '../../../../models/upload-message';
import { LearningResourceType } from '../../../../models/koodisto-proxy/learning-resource-type';
import { EducationalRole } from '../../../../models/koodisto-proxy/educational-role';
import { EducationalUse } from '../../../../models/koodisto-proxy/educational-use';

@Component({
  selector: 'app-tabs-basic-details',
  templateUrl: './basic-details.component.html',
})
export class BasicDetailsComponent implements OnInit, OnDestroy {
  private savedDataKey = environment.newERLSKey;
  private fileUploadLSKey = environment.fileUploadLSKey;
  lang: string = this.translate.currentLang;
  otherLangs: string[];
  savedData: any;
  submitted = false;

  organizationSubscription: Subscription;
  organizations: KeyValue<string, string>[];
  keywordSubscription: Subscription;
  keywords: KeyValue<string, string>[];
  learningResourceTypeSubscription: Subscription;
  learningResourceTypes: LearningResourceType[];
  educationalRoleSubscription: Subscription;
  educationalRoles: EducationalRole[];
  educationalUseSubscription: Subscription;
  educationalUses: EducationalUse[];

  addCustomItem = addCustomItem;

  modalRef: BsModalRef;

  basicDetailsForm: FormGroup;

  uploadResponse: UploadMessage = { status: '', message: 0 };
  uploadError: string;

  imageChangedEvent: any = '';
  croppedImage: ImageCroppedEvent;

  constructor(
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private router: Router,
    private backendSvc: BackendService,
  ) { }

  ngOnInit(): void {
    this.updateLanguages();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.koodistoProxySvc.updateOrganizations();
      this.koodistoProxySvc.updateKeywords();
      this.koodistoProxySvc.updateLearningResourceTypes();
      this.koodistoProxySvc.updateEducationalRoles();
      this.koodistoProxySvc.updateEducationalUses();

      this.updateLanguages();
    });

    this.organizationSubscription = this.koodistoProxySvc.organizations$
      .subscribe((organizations: KeyValue<string, string>[]) => {
        this.organizations = organizations;
      });
    this.koodistoProxySvc.updateOrganizations();

    this.keywordSubscription = this.koodistoProxySvc.keywords$
      .subscribe((keywords: KeyValue<string, string>[]) => {
        this.keywords = keywords;
      });
    this.koodistoProxySvc.updateKeywords();

    this.learningResourceTypeSubscription = this.koodistoProxySvc.learningResourceTypes$
      .subscribe((learningResourceTypes: LearningResourceType[]) => {
        this.learningResourceTypes = learningResourceTypes;
      });
    this.koodistoProxySvc.updateLearningResourceTypes();

    this.educationalRoleSubscription = this.koodistoProxySvc.educationalRoles$
      .subscribe((educationalRoles: EducationalRole[]) => {
        this.educationalRoles = educationalRoles;
      });
    this.koodistoProxySvc.updateEducationalRoles();

    this.educationalUseSubscription = this.koodistoProxySvc.educationalUses$
      .subscribe((educationalUses: EducationalUse[]) => {
        this.educationalUses = educationalUses;
      });
    this.koodistoProxySvc.updateEducationalUses();

    this.savedData = JSON.parse(sessionStorage.getItem(this.savedDataKey));

    this.basicDetailsForm = this.fb.group({
      keywords: this.fb.control(null, [ Validators.required ]),
      authors: this.fb.array([]),
      learningResourceTypes: this.fb.control(null, [ Validators.required ]),
      educationalRoles: this.fb.control(null),
      educationalUses: this.fb.control(null),
      description: this.fb.group({
        fi: this.fb.control(null),
        sv: this.fb.control(null),
        en: this.fb.control(null),
      }),
    });

    if (this.savedData) {
      if (this.savedData.keywords) {
        this.basicDetailsForm.get('keywords').setValue(this.savedData.keywords);
      }

      if (this.savedData.learningResourceTypes) {
        this.basicDetailsForm.get('learningResourceTypes').setValue(this.savedData.learningResourceTypes);
      }

      if (this.savedData.educationalRoles) {
        this.basicDetailsForm.get('educationalRoles').setValue(this.savedData.educationalRoles);
      }

      if (this.savedData.educationalUses) {
        this.basicDetailsForm.get('educationalUses').setValue(this.savedData.educationalUses);
      }

      if (this.savedData.description) {
        this.basicDetailsForm.get('description').setValue(this.savedData.description);
      }

      if (this.savedData.authors) {
        if (this.savedData.authors.length > 0) {
          this.removeAuthor(0);
        }

        this.savedData.authors.forEach(author => {
          this.authors.push(this.createAuthor(author));
        });
      }
    }
  }

  ngOnDestroy(): void {
    this.organizationSubscription.unsubscribe();
    this.keywordSubscription.unsubscribe();
    this.learningResourceTypeSubscription.unsubscribe();
    this.educationalRoleSubscription.unsubscribe();
    this.educationalUseSubscription.unsubscribe();
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event;
  }

  updateLanguages(): void {
    this.otherLangs = this.translate.getLangs().filter(lang => lang !== this.lang);
  }

  get form() {
    return this.basicDetailsForm.controls;
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-dialog-centered' })
    );
  }

  get authors(): FormArray {
    return this.basicDetailsForm.get('authors') as FormArray;
  }

  createAuthor(author?): FormGroup {
    return this.fb.group({
      author: this.fb.control(author ? author.author : null, [ Validators.required ]),
      organization: this.fb.control(author ? author.organization : null),
    });
  }

  createOrganization(organization?): FormGroup {
    return this.fb.group({
      organization: this.fb.control(organization ? organization.organization : null, [ Validators.required ]),
    });
  }

  addAuthor(): void {
    this.authors.push(this.createAuthor());
  }

  addOrganization(): void {
    this.authors.push(this.createOrganization());
  }

  removeAuthor(i: number): void {
    this.authors.removeAt(i);
  }

  uploadImage() {
    if (this.croppedImage.base64) {
      const data = {
        'base64image': this.croppedImage.base64,
      };

      this.backendSvc.uploadImage(data).subscribe(
        (res) => {
          this.uploadResponse = res;

          this.modalRef.hide();
          },
        (err) => this.uploadError = err,
      );
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.basicDetailsForm.valid && this.authors.length > 0) {
      const data = Object.assign(
        {},
        JSON.parse(sessionStorage.getItem(this.savedDataKey)),
        this.basicDetailsForm.value
      );

      // save data to session storage
      sessionStorage.setItem(this.savedDataKey, JSON.stringify(data));

      this.router.navigate(['/lisaa-oppimateriaali', 3]);
    } else {
      return;
    }
  }

  resetForm() {
    // reset form values
    this.basicDetailsForm.reset();

    // clear data from session storage
    sessionStorage.removeItem(this.savedDataKey);
    sessionStorage.removeItem(this.fileUploadLSKey);
  }

  previousTab() {
    this.router.navigate(['/lisaa-oppimateriaali', 1]);
  }
}
