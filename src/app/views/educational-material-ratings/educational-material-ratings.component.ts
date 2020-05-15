import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Ratings } from '@models/backend/ratings';
import { ActivatedRoute } from '@angular/router';
import { RatingsService } from '@services/ratings.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-educational-material-ratings',
  templateUrl: './educational-material-ratings.component.html',
  styleUrls: ['./educational-material-ratings.component.scss']
})
export class EducationalMaterialRatingsComponent implements OnInit, OnDestroy {
  materialId: number | string;
  ratingSubscription: Subscription;
  ratings: Ratings;
  lang: string = this.translate.currentLang;

  constructor(
    private route: ActivatedRoute,
    private ratingsSvc: RatingsService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.materialId = this.route.snapshot.paramMap.get('materialId');

    this.ratingSubscription = this.ratingsSvc.getRatings(this.materialId).subscribe((ratings: Ratings) => this.ratings = ratings);

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });
  }

  ngOnDestroy(): void {
    this.ratingSubscription.unsubscribe();
  }
}
