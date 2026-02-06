import { Component, OnDestroy, OnInit } from '@angular/core'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'
import { Title } from '@angular/platform-browser'
import { Subscription } from 'rxjs'
import { CollectionCard } from '@models/collections/collection-card'
import { CollectionService } from '@services/collection.service'
import { KoodistoService } from '@services/koodisto.service'

@Component({
  selector: 'app-collections-view',
  templateUrl: './collections-view.component.html',
  styleUrls: ['./collections-view.component.scss'],
  standalone: false
})
export class CollectionsViewComponent implements OnInit, OnDestroy {
  lang: string = this.translate.currentLang
  recentCollectionSubscription: Subscription
  recentCollections: CollectionCard[]
  serviceName: string

  constructor(
    private koodistoService: KoodistoService,
    private translate: TranslateService,
    private titleService: Title,
    private collectionService: CollectionService
  ) {}

  ngOnInit(): void {
    this.setTitle()

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      // Update available service languages and save them to the state management (languages$).
      // For the direct URL navigation, update available languages once for each routed parent component.
      this.koodistoService.updateLanguages()
      this.lang = event.lang
      this.setTitle()
    })
    this.recentCollectionSubscription = this.collectionService.recentCollections$.subscribe(
      (collections: CollectionCard[]) => {
        this.recentCollections = collections
      }
    )
    this.collectionService.updateRecentCollections()
  }

  ngOnDestroy(): void {
    this.recentCollectionSubscription.unsubscribe()
  }

  setTitle(): void {
    this.translate
      .get(['common.serviceName', 'titles.collections'])
      .subscribe((translations: { [key: string]: string }) => {
        this.serviceName = translations['common.serviceName']
        this.titleService.setTitle(`${translations['titles.collections']} - ${this.serviceName}`)
      })
  }
}
