import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { environment } from '../../../../../environments/environment';
import { getLocalStorageData } from '../../../../shared/shared.module';
import { BackendService } from '../../../../services/backend.service';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
})
export class PreviewComponent implements OnInit {
  private localStorageKey = environment.newERLSKey;
  private fileUploadLSKey = environment.fileUploadLSKey;
  public savedData: any;
  private fileUpload: any;

  public previewForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private backendSvc: BackendService,
  ) { }

  ngOnInit() {
    this.savedData = getLocalStorageData(this.localStorageKey);
    this.fileUpload = getLocalStorageData(this.fileUploadLSKey);

    this.previewForm = this.fb.group({
      confirm: this.fb.control(false, [ Validators.requiredTrue ])
    });
  }

  public onSubmit() {
    if (this.previewForm.valid) {
      this.backendSvc.postMeta(this.fileUpload.id, this.savedData).subscribe(res => {
        // clean up local storage
        localStorage.removeItem(this.localStorageKey);
        localStorage.removeItem(this.fileUploadLSKey);

        // redirect to new material
        this.router.navigate(['/materiaali', this.fileUpload.id, this.savedData.slug.fi]);
      });
    }
  }

  // @todo: some kind of confirmation
  public resetForm() {
    // reset form values
    this.previewForm.reset();

    // clear data from local storage
    localStorage.removeItem(this.localStorageKey);
  }

  public previousTab() {
    this.router.navigate(['/lisaa-oppimateriaali', 6]);
  }
}
