import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { KeyValue } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';

import { environment } from '../../../../../environments/environment';
import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';
import { getLocalStorageData, addCustomItem } from '../../../../shared/shared.module';
import { BackendService } from '../../../../services/backend.service';
import { UploadMessage } from '../../../../models/upload-message';

@Component({
  selector: 'app-tabs-basic-details',
  templateUrl: './basic-details.component.html',
})
export class BasicDetailsComponent implements OnInit {
  private localStorageKey = environment.newERLSKey;
  private fileUploadLSKey = environment.fileUploadLSKey;
  private lang: string = this.translate.currentLang;
  public otherLangs: string[];
  private savedData: any;

  public learningResourceTypes$: KeyValue<string, string>[];
  public educationalRoles$: KeyValue<string, string>[];
  public educationalUse$: KeyValue<string, string>[];

  // https://stackblitz.com/edit/ng-select-infinite
  private keywords = [];
  public keywordsBuffer = [];
  private bufferSize = 50;
  public loadingKeywords = false;
  public keywordsInput$ = new Subject<string>();

  private organizations = [];
  public organizationsBuffer = [];
  public loadingOrganizations = false;
  public organizationsInput$ = new Subject<string>();

  public addCustomItem = addCustomItem;

  public modalRef: BsModalRef;

  public basicDetailsForm: FormGroup;

  public uploadResponse: UploadMessage = { status: '', message: 0 };
  public uploadError: string;
  public selectedImage;

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

      this.updateLanguages();
    });

    this.savedData = getLocalStorageData(this.localStorageKey);

    this.basicDetailsForm = this.fb.group({
      image: this.fb.control(null),
      keywords: this.fb.control(null, [ Validators.required ]),
      authors: this.fb.array([
        this.createAuthor(),
      ]),
      learningResourceType: this.fb.control(null, [ Validators.required ]),
      educationalRoles: this.fb.control(null),
      educationalUse: this.fb.control(null),
      description: this.fb.group({
        fi: this.fb.control(null),
        sv: this.fb.control(null),
        en: this.fb.control(null),
      }),
    });

    this.koodistoProxySvc.getData('oppimateriaalityypit', this.lang).subscribe(data => {
      this.learningResourceTypes$ = data;
    });

    this.koodistoProxySvc.getData('kohderyhmat', this.lang).subscribe(data => {
      this.educationalRoles$ = data;
    });

    this.koodistoProxySvc.getData('kayttokohteet', this.lang).subscribe(data => {
      this.educationalUse$ = data;
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

  public updateLanguages(): void {
    this.otherLangs = this.translate.getLangs().filter(lang => lang !== this.lang);
  }

  get form() {
    return this.basicDetailsForm.controls;
  }

  public fetchMoreKeywords(value: string) {
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

  public fetchMoreOrganizations(value: string) {
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

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-dialog-centered' })
    );
  }

  get authors(): FormArray {
    return this.basicDetailsForm.get('authors') as FormArray;
  }

  public createAuthor(author?): FormGroup {
    return this.fb.group({
      author: this.fb.control(author ? author.author : null, [ Validators.required ]),
      organization: this.fb.control(author ? author.organization : null),
    });
  }

  public addAuthor(): void {
    this.authors.push(this.createAuthor());
  }

  public removeAuthor(i: number): void {
    this.authors.removeAt(i);
  }

  public processImage(value) {
    if (value.target.files.length > 0) {
      const image = value.target.files[0];
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        this.selectedImage = { src: reader.result, file: image };

        // @todo: upload image
      }, false);

      if (image) {
        reader.readAsDataURL(image);
      }
    }
  }

  public uploadImage() {
    if (this.selectedImage.file) {
      const formData = new FormData();
      formData.append('image', this.selectedImage.file);

      this.backendSvc.uploadImage(formData).subscribe(
        (res) => this.uploadResponse = res,
        (err) => this.uploadError = err,
      );
    }
  }

  public onSubmit() {
    if (this.basicDetailsForm.valid) {
      const data = Object.assign({}, getLocalStorageData(this.localStorageKey), this.basicDetailsForm.value);

      // save data to local storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));

      this.router.navigate(['/lisaa-oppimateriaali', 3]);
    } else {
      return;
    }
  }

  // @todo: some kind of confirmation
  public resetForm() {
    // reset form values
    this.basicDetailsForm.reset();

    // clear data from local storage
    localStorage.removeItem(this.localStorageKey);
    localStorage.removeItem(this.fileUploadLSKey);
  }

  public previousTab() {
    this.router.navigate(['/lisaa-oppimateriaali', 1]);
  }
}
