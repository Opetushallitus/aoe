import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RatingsService } from '@services/ratings.service';
import { Rating } from '@models/backend/ratings';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Toast } from '@models/translations/toast';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-educational-material-rating-modal',
  templateUrl: './educational-material-rating-modal.component.html',
  styleUrls: ['./educational-material-rating-modal.component.scss']
})
export class EducationalMaterialRatingModalComponent implements OnInit {
  materialId: number;
  materialName: string;
  form: FormGroup;
  ratingAddedTitle: string;

  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private ratingsSvc: RatingsService,
    private translate: TranslateService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      materialId: this.fb.control(this.materialId, [
        Validators.required,
      ]),
      ratingContent: this.fb.control(null, [
        Validators.min(1),
        Validators.max(5),
      ]),
      ratingVisual: this.fb.control(null, [
        Validators.min(1),
        Validators.max(5),
      ]),
      feedbackPositive: this.fb.control(null, [
        Validators.maxLength(1000),
      ]),
      feedbackSuggest: this.fb.control(null, [
        Validators.maxLength(1000),
      ]),
      feedbackPurpose: this.fb.control(null, [
        Validators.maxLength(1000),
      ]),
    });

    this.ratingsSvc.getRating(this.materialId).subscribe((rating: Rating) => {
      this.form.patchValue(rating);
    });

    this.translate.get('forms.editEducationalResource.toasts.ratingAdded').subscribe((translation: Toast) => {
      this.ratingAddedTitle = translation.title;
    });
  }

  get ratingContentCtrl(): FormControl {
    return this.form.get('ratingContent') as FormControl;
  }

  get ratingVisualCtrl(): FormControl {
    return this.form.get('ratingVisual') as FormControl;
  }

  get feedbackPositiveCtrl(): FormControl {
    return this.form.get('feedbackPositive') as FormControl;
  }

  get feedbackSuggestCtrl(): FormControl {
    return this.form.get('feedbackSuggest') as FormControl;
  }

  get feedbackPurposeCtrl(): FormControl {
    return this.form.get('feedbackPurpose') as FormControl;
  }

  onSubmit(): void {
    if (this.form.valid) {
      if (this.form.dirty) {
        this.ratingsSvc.postRating(this.form.value).subscribe(
          () => {
            this.bsModalRef.hide();
            this.toastr.success(null, this.ratingAddedTitle);
          },
          (err: HttpErrorResponse) => this.toastr.error(null, err.error),
        );
      }

      this.bsModalRef.hide();
    }
  }
}
