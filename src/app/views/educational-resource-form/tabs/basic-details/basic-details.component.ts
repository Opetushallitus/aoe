import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { ImageCroppedEvent } from 'ngx-image-cropper';

import { environment } from '../../../../../environments/environment';
import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';
import { getLocalStorageData, addCustomItem } from '../../../../shared/shared.module';
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
  private localStorageKey = environment.newERLSKey;
  private fileUploadLSKey = environment.fileUploadLSKey;
  lang: string = this.translate.currentLang;
  otherLangs: string[];
  savedData: any;

  learningResourceTypeSubscription: Subscription;
  learningResourceTypes: LearningResourceType[];
  educationalRoleSubscription: Subscription;
  educationalRoles: EducationalRole[];
  educationalUseSubscription: Subscription;
  educationalUses: EducationalUse[];

  // https://stackblitz.com/edit/ng-select-infinite
  keywords = [];
  keywordsBuffer = [];
  bufferSize = 50;
  loadingKeywords = false;
  keywordsInput$ = new Subject<string>();

  organizations = [];
  organizationsBuffer = [];
  loadingOrganizations = false;
  organizationsInput$ = new Subject<string>();

  addCustomItem = addCustomItem;

  modalRef: BsModalRef;

  basicDetailsForm: FormGroup;

  uploadResponse: UploadMessage = { status: '', message: 0 };
  uploadError: string;
  selectedImage;

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

      this.koodistoProxySvc.updateLearningResourceTypes();
      this.koodistoProxySvc.updateEducationalRoles();
      this.koodistoProxySvc.updateEducationalUses();

      this.updateLanguages();
    });

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

    this.savedData = getLocalStorageData(this.localStorageKey);

    this.basicDetailsForm = this.fb.group({
      image: this.fb.control(null),
      keywords: this.fb.control(null, [ Validators.required ]),
      authors: this.fb.array([
        this.createAuthor(),
      ]),
      learningResourceTypes: this.fb.control(null, [ Validators.required ]),
      educationalRoles: this.fb.control(null),
      educationalUses: this.fb.control(null),
      description: this.fb.group({
        fi: this.fb.control(null),
        sv: this.fb.control(null),
        en: this.fb.control(null),
      }),
    });

    this.koodistoProxySvc.getData('asiasanat', this.lang).subscribe(keywords => {
      this.keywords = keywords;
    });

    this.onKeywordsSearch();
    this.onOrganizationsSearch();

    if (this.savedData) {
      if (this.savedData.keywords) {
        this.basicDetailsForm.get('keywords').setValue(this.savedData.keywords);
      }

      if (this.savedData.learningResourceType) {
        this.basicDetailsForm.get('learningResourceType').setValue(this.savedData.learningResourceType);
      }

      if (this.savedData.educationalRoles) {
        this.basicDetailsForm.get('educationalRoles').setValue(this.savedData.educationalRoles);
      }

      if (this.savedData.educationalUse) {
        this.basicDetailsForm.get('educationalUse').setValue(this.savedData.educationalUse);
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

  fetchMoreKeywords(value: string) {
    const len = this.keywordsBuffer.length;
    const more = this.keywords
      .filter(x => x.value.includes(value))
      .slice(len, this.bufferSize + len);

    this.loadingKeywords = true;

    setTimeout(() => {
      this.loadingKeywords = false;
      this.keywordsBuffer = this.keywordsBuffer.concat(more);
    }, 200);
  }

  private onKeywordsSearch() {
    this.keywordsInput$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(value => this.fakeKeywordsService(value))
    ).subscribe(data => {
      this.keywordsBuffer = data.slice(0, this.bufferSize);
    });
  }

  private fakeKeywordsService(value: string) {
    return this.koodistoProxySvc.getData('asiasanat', this.lang)
      .pipe(
        map(data => data.filter((x: { value: string }) => x.value.toLowerCase().includes(value.toLowerCase())))
      );
  }

  fetchMoreOrganizations(value: string) {
    const len = this.organizationsBuffer.length;
    const more = this.organizations
      .filter(x => x.value.includes(value))
      .slice(len, this.bufferSize + len);

    this.loadingOrganizations = true;

    setTimeout(() => {
      this.loadingOrganizations = false;
      this.organizationsBuffer = this.organizationsBuffer.concat(more);
    }, 200);
  }

  private onOrganizationsSearch() {
    this.organizationsInput$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(value => this.fakeOrganizationsService(value))
    ).subscribe(data => {
      this.organizationsBuffer = data.slice(0, this.bufferSize);
    });
  }

  private fakeOrganizationsService(value: string) {
    return this.koodistoProxySvc.getData('organisaatiot', this.lang)
      .pipe(
        map(data => data.filter((x: { value: string }) => x.value.toLowerCase().includes(value.toLowerCase())))
      );
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

  addAuthor(): void {
    this.authors.push(this.createAuthor());
  }

  removeAuthor(i: number): void {
    this.authors.removeAt(i);
  }

  processImage(value) {
    if (value.target.files.length > 0) {
      const image = value.target.files[0];
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        this.selectedImage = { src: reader.result, file: image };
      }, false);

      if (image) {
        reader.readAsDataURL(image);
      }
    }
  }

  uploadImage() {
    if (this.croppedImage.base64) {
      const data = {
        'base64image': this.croppedImage.base64,
      };

      this.backendSvc.uploadImage(data).subscribe(
        (res) => this.uploadResponse = res,
        (err) => this.uploadError = err,
      );
    }
  }

  onSubmit() {
    if (this.basicDetailsForm.valid) {
      const data = Object.assign({}, getLocalStorageData(this.localStorageKey), this.basicDetailsForm.value);

      // save data to local storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));

      this.router.navigate(['/lisaa-oppimateriaali', 3]);
    } else {
      return;
    }
  }

  resetForm() {
    // reset form values
    this.basicDetailsForm.reset();

    // clear data from local storage
    localStorage.removeItem(this.localStorageKey);
    localStorage.removeItem(this.fileUploadLSKey);
  }

  previousTab() {
    this.router.navigate(['/lisaa-oppimateriaali', 1]);
  }
}
