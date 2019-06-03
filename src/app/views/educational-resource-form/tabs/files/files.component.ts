import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef, TabsetComponent } from 'ngx-bootstrap';

@Component({
  selector: 'app-tabs-files',
  templateUrl: './files.component.html',
})
export class FilesComponent implements OnInit {
  @Input() tabs: TabsetComponent;

  public fileUploadForm: FormGroup;
  public modalRef: BsModalRef;
  public selectedLang = 'en';

  constructor(
    private fb: FormBuilder,
    private modalService: BsModalService,
  ) { }

  ngOnInit() {
    this.fileUploadForm = this.fb.group({
      name: this.fb.group({
        fi: this.fb.control(null, [ Validators.required ]),
        sv: this.fb.control(null),
        en: this.fb.control(null),
      }),
      files: this.fb.array([
        this.createFile(),
        this.createFile(),
      ]),
    });
  }

  get files() {
    return this.fileUploadForm.get('files') as FormArray;
  }

  public createFile(): FormGroup {
    return this.fb.group({
      file: this.fb.control(null),
      link: this.fb.control(null),
      language: this.fb.control('fi', [ Validators.required ]),
      displayName: this.fb.control(null, [ Validators.required ]),
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
    console.log(this.fileUploadForm.value);

    this.tabs.tabs[1].active = true;
  }
}
