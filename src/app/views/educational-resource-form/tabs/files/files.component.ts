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
      files: this.fb.array([
        this.fb.control(null)
      ]),
    });
  }

  get files() {
    return this.fileUploadForm.get('files') as FormArray;
  }

  public addFile() {
    this.files.push(this.fb.control(null));
  }

  public removeFile(i: number) {
    this.files.removeAt(i);
  }

  public onSubmit() {
    console.log(this.fileUploadForm.value);

    this.tabs.tabs[1].active = true;
  }
}
