import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { TabsetComponent } from 'ngx-bootstrap';

@Component({
  selector: 'app-tabs-files',
  templateUrl: './files.component.html',
})
export class FilesComponent implements OnInit {
  @Input() tabs: TabsetComponent;

  public fileUploadForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.fileUploadForm = this.fb.group({
      name: this.fb.control(null),
      files: this.fb.array([ this.createFile() ]),
    });
  }

  get files() {
    return this.fileUploadForm.get('files') as FormArray;
  }

  public createFile(): FormGroup {
    return this.fb.group({
      file: this.fb.control(null),
      link: this.fb.control(null),
      language: this.fb.control('fi'),
      displayName: this.fb.control(null),
    });
  }

  public addFile() {
    this.files.push(this.createFile());
  }

  public createDisplayName(file): void {
    console.log(file);
  }

  public onSubmit() {
    console.log(this.fileUploadForm.value);

    this.tabs.tabs[1].active = true;
  }
}
