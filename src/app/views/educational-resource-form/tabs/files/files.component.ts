import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { KeyValue } from '@angular/common';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import slugify from 'slugify';

import { environment } from '../../../../../environments/environment';
import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';
import { BackendService } from '../../../../services/backend.service';
import { getLocalStorageData } from '../../../../shared/shared.module';
import { AuthService } from '../../../../services/auth.service';
import { UploadMessage } from '../../../../models/upload-message';

@Component({
  selector: 'app-tabs-files',
  templateUrl: './files.component.html',
})
export class FilesComponent implements OnInit {
  private localStorageKey = environment.newERLSKey;
  private fileUploadLSKey = environment.fileUploadLSKey;
  lang: string = this.translate.currentLang;
  otherLangs: string[];
  savedData: any;

  fileUploadForm: FormGroup;
  submitted = false;
  modalRef: BsModalRef;
  uploadResponse: UploadMessage = { status: '', message: 0 };
  uploadError: string;
  private myFiles = [];

  languages$: KeyValue<string, string>[];
  defaultLanguage$: KeyValue<string, string>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private modalService: BsModalService,
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
    private backendSvc: BackendService,
    private authSvc: AuthService,
  ) { }

  ngOnInit() {
    this.fileUploadForm = this.fb.group({
      name: this.fb.group({
        fi: this.fb.control(null),
        sv: this.fb.control(null),
        en: this.fb.control(null),
      }),
      slug: this.fb.group({
        fi: this.fb.control(null),
        sv: this.fb.control(null),
        en: this.fb.control(null),
      }),
      files: this.fb.array([
        this.createFile(),
        this.createFile(),
      ]),
    });

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.updateLanguages();
    });

    this.koodistoProxySvc.getData('kielet', this.lang).subscribe(data => {
      this.languages$ = data;
    });

    this.koodistoProxySvc.getData(`kielet/${this.lang.toUpperCase()}`, this.lang).subscribe(data => {
      this.defaultLanguage$ = data;

      this.files.controls.forEach(control => {
        control.get('language').setValue(this.defaultLanguage$);
      });
    });

    this.savedData = getLocalStorageData(this.localStorageKey);

    if (this.savedData) {
      if (this.savedData.files) {
        while (this.files.length) {
          this.files.removeAt(0);
        }
      }

      if (this.savedData.name) {
        this.fileUploadForm.get('name').patchValue(this.savedData.name);
      }

      if (this.savedData.slug) {
        this.fileUploadForm.get('slug').patchValue(this.savedData.slug);
      }
    }

    // this.onChanges();
  }

  updateLanguages(): void {
    this.otherLangs = this.translate.getLangs().filter(lang => lang !== this.lang);
  }

  get name(): FormControl {
    return this.fileUploadForm.get('name.fi') as FormControl;
  }

  get files(): FormArray {
    return this.fileUploadForm.get('files') as FormArray;
  }

  createFile(): FormGroup {
    return this.fb.group({
      file: [''],
      link: this.fb.control(null),
      language: this.fb.control(null),
      displayName: this.fb.group({
        fi: this.fb.control(null),
        sv: this.fb.control(null),
        en: this.fb.control(null),
      }),
    });
  }

  addFile(): void {
    this.files.push(this.createFile());
  }

  openModal(template: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-dialog-centered' })
    );
  }

  onChanges(): void {
    this.fileUploadForm.get('files').valueChanges.subscribe(() => {
      this.files.controls.forEach((control) => {
        const fileCtrl = control.get('file');
        const linkCtrl = control.get('link');

        if (linkCtrl.value !== null) {
          fileCtrl.setValidators(null);
          fileCtrl.updateValueAndValidity({ emitEvent: false });
        }

        if (fileCtrl.value !== null) {
          linkCtrl.setValidators(null);
          linkCtrl.updateValueAndValidity({ emitEvent: false });
        }
      });
    });
  }

  updateSlug(value, lang): void {
    this.fileUploadForm.get(`slug.${lang}`).setValue(slugify(value.target.value).toLowerCase());
  }

  onFileChange(event, i): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      this.myFiles.push(file);
      this.files.at(i).get('file').setValue(file);

      // remove extension from filename
      this.files.at(i).get('displayName').setValue({
        fi: file.name.replace(/\.[^/.]+$/, ''),
        sv: file.name.replace(/\.[^/.]+$/, ''),
        en: file.name.replace(/\.[^/.]+$/, ''),
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;

    // remove files that doesn't have either file nor link
    this.files.controls.forEach((control, i) => {
      if (control.get('file').value === '' && control.get('link').value === null) {
        this.files.removeAt(i);
      }
    });

    if (this.fileUploadForm.valid) {
      const data = Object.assign(
        {},
        getLocalStorageData(this.localStorageKey),
        { name: this.fileUploadForm.get('name').value },
        { slug: this.fileUploadForm.get('slug').value },
      );

      // save data to local storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));

      const formData = new FormData();

      this.myFiles.forEach(file => {
        formData.append('myFiles', file);
      });

      formData.append('username', this.authSvc.getUser().username);

      this.backendSvc.uploadFiles(formData).subscribe(
        (res) => {
          this.uploadResponse = res;

          if (this.uploadResponse.status === 'completed') {
            const fileUpload = getLocalStorageData(this.fileUploadLSKey);
            const fileDetails: any[] = [];

            fileUpload.material.forEach(m => {
              const file = this.files.value.find(f => f.file.name === m.createFrom);

              fileDetails.push({
                id: m.id,
                displayName: file.displayName,
                language: file.language,
              });
            });

            const updatedData = Object.assign(
              {},
              getLocalStorageData(this.localStorageKey),
              { fileDetails: fileDetails },
            );

            // save data to local storage
            localStorage.setItem(this.localStorageKey, JSON.stringify(updatedData));

            this.router.navigate(['/lisaa-oppimateriaali', 2]);
          }
        },
        (err) => this.uploadError = err,
      );
    }
  }

  resetForm(): void {
    // reset submit status
    this.submitted = false;

    // reset form values
    this.fileUploadForm.reset();

    // clear data from local storage
    localStorage.removeItem(this.localStorageKey);
    localStorage.removeItem(this.fileUploadLSKey);
  }
}
