import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef, TabsetComponent } from 'ngx-bootstrap';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import slugify from 'slugify';

import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';
import { getLocalStorageData } from '../../../../shared/shared.module';

@Component({
  selector: 'app-tabs-files',
  templateUrl: './files.component.html',
})
export class FilesComponent implements OnInit {
  @Input() tabs: TabsetComponent;

  private localStorageKey = 'aoe.new-educational-resource';
  private lang: string = this.translate.currentLang;
  private savedData: any;

  public fileUploadForm: FormGroup;
  public modalRef: BsModalRef;

  public languages$: any[];

  constructor(
    private fb: FormBuilder,
    private modalService: BsModalService,
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.savedData = getLocalStorageData(this.localStorageKey);

    this.fileUploadForm = this.fb.group({
      name: this.fb.group({
        fi: this.fb.control(null, [ Validators.required ]),
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

    this.koodistoProxySvc.getData('kielet', this.lang).subscribe(data => {
      this.languages$ = data;
    });

    if (this.savedData) {
      if (this.savedData.files) {
        while (this.files.length) {
          this.files.removeAt(0);
        }

        this.savedData.files.forEach(() => this.addFile());

        this.fileUploadForm.get('files').setValue(this.savedData.files);
      }

      if (this.savedData.name) {
        this.fileUploadForm.get('name').patchValue(this.savedData.name);
      }

      if (this.savedData.slug) {
        this.fileUploadForm.get('slug').patchValue(this.savedData.slug);
      }
    }
  }

  get files() {
    return this.fileUploadForm.get('files') as FormArray;
  }

  public createFile(): FormGroup {
    return this.fb.group({
      file: this.fb.control(null),
      link: this.fb.control(null),
      language: this.fb.control(null),
      displayName: this.fb.group({
        fi: this.fb.control(null),
        sv: this.fb.control(null),
        en: this.fb.control(null),
      }),
    });
  }

  public addFile() {
    this.files.push(this.createFile());
  }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-dialog-centered' })
    );
  }

  public onSubmit() {
    // remove files that doesn't have either file or link
    this.files.controls.forEach((control, i) => {
      if (control.get('link').value === null) {
        this.files.removeAt(i);
      }
    });

    if (this.fileUploadForm.valid) {
      const slugs = {
        fi: this.fileUploadForm.get('name').value.fi ? slugify(this.fileUploadForm.get('name').value.fi) : undefined,
        sv: this.fileUploadForm.get('name').value.sv ? slugify(this.fileUploadForm.get('name').value.sv) : undefined,
        en: this.fileUploadForm.get('name').value.en ? slugify(this.fileUploadForm.get('name').value.en) : undefined,
      };

      const newData = {
        createdAt: new Date(),
        name: this.fileUploadForm.get('name').value,
        slug: slugs,
        files: this.fileUploadForm.get('files').value,
      };

      const data = Object.assign({}, getLocalStorageData(this.localStorageKey), newData);

      // save data to local storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));

      this.tabs.tabs[1].active = true;
    }
  }

  // @todo: some kind of confirmation
  public resetForm() {
    // reset form values
    this.fileUploadForm.reset();

    // clear data from local storage
    localStorage.removeItem(this.localStorageKey);
  }
}
