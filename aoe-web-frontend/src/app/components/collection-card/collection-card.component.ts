import { Component, Input, OnInit } from '@angular/core'
import {
  CollectionCard,
  CollectionCardEducationalLevel,
  CollectionCardKeyword
} from '@models/collections/collection-card'
import { getValuesWithinLimits } from '../../shared/shared.module'
import { Observable } from 'rxjs'
import { KoodistoService } from '@services/koodisto.service'
import { TranslateService } from '@ngx-translate/core'
import { Language } from '@models/koodisto/language'
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-collection-card',
  templateUrl: './collection-card.component.html',
  styleUrls: ['./collection-card.component.scss'],
  standalone: false
})
export class CollectionCardComponent implements OnInit {
  @Input() collection: CollectionCard

  educationalLevels: CollectionCardEducationalLevel[]
  keywords: CollectionCardKeyword[]
  languages$: Observable<Language[]>

  constructor(
    private translate: TranslateService,
    private koodistoService: KoodistoService
  ) {}

  ngOnInit(): void {
    this.languages$ = this.koodistoService.languages$.pipe(
      map((languages: Language[]) =>
        languages.filter((language: Language) =>
          this.collection.languages.includes(language.key.toLowerCase())
        )
      )
    )
    this.educationalLevels = getValuesWithinLimits(this.collection.educationalLevels, 'value')
    this.keywords = getValuesWithinLimits(this.collection.keywords, 'value')
  }
}
