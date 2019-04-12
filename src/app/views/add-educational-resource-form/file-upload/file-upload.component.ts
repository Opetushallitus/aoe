import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
})
export class FileUploadComponent implements OnInit {
  private localStorageKey = 'aoe.new-educational-resource';
  public submitted = false;
  public fileUploadForm: FormGroup;
  public files: FormArray;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.fileUploadForm = this.fb.group({
      files: this.fb.array([ this.createFile() ]),
    });
  }

  createFile(): FormGroup {
    return this.fb.group({
      file: null,
      subtitles: this.fb.array([ this.createSubtitle()]),
    });
  }

  addFile(): void {
    this.files = this.fileUploadForm.get('files') as FormArray;
    this.files.push(this.createFile());
  }

  createSubtitle(): FormGroup {
    return this.fb.group({
      file: null,
      lang: null,
    });
  }

  // addSubtitle(): void {
  //   this.files = this.fileUploadForm.get('subtitles') as FormArray;
  //   this.files.push(this.createSubtitle());
  // }

  onSubmit() {
    this.submitted = true;

    console.log(this.fileUploadForm.value);
  }

  // @todo: some kind of confirmation
  resetForm() {
    // reset form values
    this.fileUploadForm.reset();
  }
}
