import { Component, OnDestroy, OnInit } from '@angular/core'
import { Subscription } from 'rxjs'
import { Ratings } from '@models/backend/ratings'
import { ActivatedRoute } from '@angular/router'
import { RatingsService } from '@services/ratings.service'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'
import { Title } from '@angular/platform-browser'

@Component({
    selector: 'app-educational-material-ratings',
    templateUrl: './educational-material-ratings.component.html',
    styleUrls: ['./educational-material-ratings.component.scss'],
    standalone: false
})
export class EducationalMaterialRatingsComponent implements OnInit, OnDestroy {
  materialId: number | string
  ratingSubscription: Subscription
  ratings: Ratings
  lang: string = this.translate.currentLang

  constructor(
    private route: ActivatedRoute,
    private ratingsSvc: RatingsService,
    private translate: TranslateService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.setTitle()

    this.materialId = this.route.snapshot.paramMap.get('materialId')

    this.ratingSubscription = this.ratingsSvc
      .getRatings(this.materialId)
      .subscribe((ratings: Ratings) => (this.ratings = ratings))

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang

      this.setTitle()
    })
  }

  ngOnDestroy(): void {
    this.ratingSubscription.unsubscribe()
  }

  setTitle(): void {
    this.translate
      .get(['common.serviceName', 'titles.reviews'])
      .subscribe((translations: { [key: string]: string }) => {
        this.titleService.setTitle(
          `${translations['titles.reviews']} - ${translations['common.serviceName']}`
        )
      })
  }
}
