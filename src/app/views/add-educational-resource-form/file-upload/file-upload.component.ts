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
  public subtitles: FormArray;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.fileUploadForm = this.fb.group({
      files: this.fb.array([ this.createFile() ]),
      subtitles: this.fb.array([ this.createSubtitle() ]),
    });
  }

  createFile(): FormGroup {
    return this.fb.group({
      file: null,
    });
  }

  addFile(): void {
    this.files = this.fileUploadForm.get('files') as FormArray;
    this.files.push(this.createFile());
  }

  createSubtitle(i?: number): FormGroup {
    return this.fb.group({
      fileId: i,
      lang: null,
      subtitle: null,
    });
  }

  addSubtitle(i: number): void {
    this.subtitles = this.fileUploadForm.get('subtitles') as FormArray;
    this.subtitles.push(this.createSubtitle(i));
  }

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
