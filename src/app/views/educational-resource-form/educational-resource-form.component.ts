import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { TabsetComponent } from 'ngx-bootstrap';

@Component({
  selector: 'app-educational-resource-form',
  templateUrl: './educational-resource-form.component.html',
})
export class EducationalResourceFormComponent implements OnInit {
  @ViewChild('formTabs') formTabs: TabsetComponent;

  public fileUploadForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.fileUploadForm = this.fb.group({
      files: this.fb.array([
        this.fb.control(null)
      ]),
    });
  }

  get files() {
    return this.fileUploadForm.get('files') as FormArray;
  }

  addFile() {
    this.files.push(this.fb.control(null));
  }

  public onFilesSubmit() {
    console.log(this.fileUploadForm.value);
  }
}
