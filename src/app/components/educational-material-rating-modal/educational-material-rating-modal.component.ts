import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RatingsService } from '@services/ratings.service';
import { RatingPost } from '@models/rating-post';

@Component({
  selector: 'app-educational-material-rating-modal',
  templateUrl: './educational-material-rating-modal.component.html',
  styleUrls: ['./educational-material-rating-modal.component.scss']
})
export class EducationalMaterialRatingModalComponent implements OnInit {
  materialId: number;
  materialName: string;
  form: FormGroup;

  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private ratingsSvc: RatingsService
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
  }

  onSubmit(): void {
    this.ratingsSvc.postRating(this.form.value).subscribe(
      () => this.bsModalRef.hide(),
      (err) => console.error(err),
    );
  }
}
