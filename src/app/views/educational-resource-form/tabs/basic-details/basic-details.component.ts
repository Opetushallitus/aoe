import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { KeyValue } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ImageCroppedEvent } from 'ngx-image-cropper';

import { environment } from '../../../../../environments/environment';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { addCustomItem, descriptionValidator, textInputValidator } from '../../../../shared/shared.module';
import { BackendService } from '@services/backend.service';
import { UploadMessage } from '@models/upload-message';
import { LearningResourceType } from '@models/koodisto-proxy/learning-resource-type';
import { EducationalRole } from '@models/koodisto-proxy/educational-role';
import { EducationalUse } from '@models/koodisto-proxy/educational-use';
import { Title } from '@angular/platform-browser';
import { validatorParams } from '../../../../constants/validator-params';

@Component({
  selector: 'app-tabs-basic-details',
  templateUrl: './basic-details.component.html',
})
export class BasicDetailsComponent implements OnInit, OnDestroy {
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

  form: FormGroup;

  uploadResponse: UploadMessage = { status: '', message: 0 };
  uploadError: string;

  imageChangedEvent: any = '';
  croppedImage: ImageCroppedEvent;
  thumbnailSrc: string;

  constructor(
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private router: Router,
    private backendSvc: BackendService,
    private titleSvc: Title,
  ) { }

  ngOnInit(): void {
    this.setTitle();
    this.updateLanguages();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.koodistoProxySvc.updateOrganizations();
      this.koodistoProxySvc.updateKeywords();
      this.koodistoProxySvc.updateLearningResourceTypes();
      this.koodistoProxySvc.updateEducationalRoles();
      this.koodistoProxySvc.updateEducationalUses();

      this.setTitle();
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

    this.savedData = JSON.parse(sessionStorage.getItem(environment.newERLSKey));

    this.form = this.fb.group({
      keywords: this.fb.control(null),
      authors: this.fb.array([]),
      learningResourceTypes: this.fb.control(null),
      educationalRoles: this.fb.control(null),
      educationalUses: this.fb.control(null),
      description: this.fb.group({
        fi: this.fb.control(null, [
          Validators.maxLength(validatorParams.description.maxLength),
          descriptionValidator(),
        ]),
        sv: this.fb.control(null, [
          Validators.maxLength(validatorParams.description.maxLength),
          descriptionValidator(),
        ]),
        en: this.fb.control(null, [
          Validators.maxLength(validatorParams.description.maxLength),
          descriptionValidator(),
        ]),
      }),
    });

    if (this.savedData) {
      if (this.savedData.thumbnail) {
        this.thumbnailSrc = this.savedData.thumbnail;
      }

      if (this.savedData.keywords) {
        this.form.get('keywords').setValue(this.savedData.keywords);
      }

      if (this.savedData.learningResourceTypes) {
        this.learningResourceTypesCtrl.setValue(this.savedData.learningResourceTypes);
      }

      if (this.savedData.educationalRoles) {
        this.educationalRolesCtrl.setValue(this.savedData.educationalRoles);
      }

      if (this.savedData.educationalUses) {
        this.educationalUsesCtrl.setValue(this.savedData.educationalUses);
      }

      if (this.savedData.description) {
        this.form.get('description').setValue(this.savedData.description);
      }

      if (this.savedData.authors) {
        if (this.savedData.authors.length > 0) {
          this.removeAuthor(0);
        }

        this.savedData.authors.forEach(author => {
          if (author.author) {
            this.authors.push(this.createAuthor(author));
          } else {
            this.authors.push(this.createOrganization(author));
          }
        });
      }
    }
  }

  ngOnDestroy(): void {
    // save data if its valid, dirty and not submitted
    if (this.submitted === false && this.form.dirty && this.form.valid) {
      this.saveData();
    }

    this.organizationSubscription.unsubscribe();
    this.keywordSubscription.unsubscribe();
    this.learningResourceTypeSubscription.unsubscribe();
    this.educationalRoleSubscription.unsubscribe();
    this.educationalUseSubscription.unsubscribe();
  }

  setTitle(): void {
    this.translate.get('titles.addMaterial').subscribe((translations: any) => {
      this.titleSvc.setTitle(`${translations.main}: ${translations.basic} ${environment.title}`);
    });
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

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-dialog-centered' })
    );
  }

  get authors(): FormArray {
    return this.form.get('authors') as FormArray;
  }

  get learningResourceTypesCtrl(): FormControl {
    return this.form.get('learningResourceTypes') as FormControl;
  }

  get educationalRolesCtrl(): FormControl {
    return this.form.get('educationalRoles') as FormControl;
  }

  get educationalUsesCtrl(): FormControl {
    return this.form.get('educationalUses') as FormControl;
  }

  get descriptionCtrl(): FormGroup {
    return this.form.get('description') as FormGroup;
  }

  createAuthor(author?): FormGroup {
    return this.fb.group({
      author: this.fb.control(author ? author.author : null, [
        Validators.maxLength(validatorParams.author.author.maxLength),
        textInputValidator(),
      ]),
      organization: this.fb.control(author ? author.organization : null),
    });
  }

  createOrganization(organization?): FormGroup {
    return this.fb.group({
      organization: this.fb.control(organization ? organization.organization : null),
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
      this.backendSvc.uploadImage(this.croppedImage.base64).subscribe(
        (res) => {
          this.uploadResponse = res;
          this.thumbnailSrc = this.croppedImage.base64;

          const savedData = JSON.parse(sessionStorage.getItem(environment.newERLSKey));

          savedData.thumbnail = this.croppedImage.base64;

          sessionStorage.setItem(environment.newERLSKey, JSON.stringify(savedData));

          this.modalRef.hide();
          },
        (err) => this.uploadError = err,
      );
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.valid) {
      if (this.educationalRolesCtrl.value && this.educationalRolesCtrl.value.length === 0) {
        this.educationalRolesCtrl.setValue(null);
      }

      if (this.educationalUsesCtrl.value && this.educationalUsesCtrl.value.length === 0) {
        this.educationalUsesCtrl.setValue(null);
      }

      if (this.form.dirty) {
        this.saveData();
      }

      this.router.navigate(['/lisaa-oppimateriaali', 3]);
    }
  }

  saveData(): void {
    const data = Object.assign(
      {},
      JSON.parse(sessionStorage.getItem(environment.newERLSKey)),
      this.form.value
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
    this.router.navigate(['/lisaa-oppimateriaali', 1]);
  }
}
