import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Ratings } from '@models/backend/ratings';
import { ActivatedRoute } from '@angular/router';
import { RatingsService } from '@services/ratings.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

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
    private titleSvc: Title,
  ) { }

  ngOnInit(): void {
    this.setTitle();

    this.materialId = this.route.snapshot.paramMap.get('materialId');

    this.ratingSubscription = this.ratingsSvc.getRatings(this.materialId).subscribe((ratings: Ratings) => this.ratings = ratings);

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.setTitle();
    });
  }

  ngOnDestroy(): void {
    this.ratingSubscription.unsubscribe();
  }

  setTitle(): void {
    this.translate.get('titles.reviews').subscribe((title: string) => {
      this.titleSvc.setTitle(`${title} ${environment.title}`);
    });
  }
}
