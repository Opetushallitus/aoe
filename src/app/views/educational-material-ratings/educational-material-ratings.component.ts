import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Ratings } from '@models/backend/ratings';
import { ActivatedRoute } from '@angular/router';
import { RatingsService } from '@services/ratings.service';

@Component({
  selector: 'app-educational-material-ratings',
  templateUrl: './educational-material-ratings.component.html',
  styleUrls: ['./educational-material-ratings.component.scss']
})
export class EducationalMaterialRatingsComponent implements OnInit, OnDestroy {
  materialId: number | string;
  ratingSubscription: Subscription;
  ratings: Ratings;

  constructor(
    private route: ActivatedRoute,
    private ratingsSvc: RatingsService,
  ) { }

  ngOnInit(): void {
    this.materialId = this.route.snapshot.paramMap.get('materialId');

    this.ratingSubscription = this.ratingsSvc.getRatings(this.materialId).subscribe((ratings: Ratings) => this.ratings = ratings);
  }

  ngOnDestroy(): void {
    this.ratingSubscription.unsubscribe();
  }
}
