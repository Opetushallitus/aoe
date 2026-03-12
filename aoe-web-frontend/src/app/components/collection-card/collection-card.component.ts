import { Component, Input, OnInit } from '@angular/core'
import {
  CollectionCard,
  CollectionCardEducationalLevel,
  CollectionCardKeyword
} from '@models/collections/collection-card'
import { getValuesWithinLimits } from '../../shared/shared.module'
import { Observable } from 'rxjs'
import { KoodistoService } from '@services/koodisto.service'
import { TranslateService, TranslatePipe } from '@ngx-translate/core'
import { Language } from '@models/koodisto/language'
import { map } from 'rxjs/operators'
import { FocusRemoverDirective } from '../../directives/focus-remover.directive'
import { RouterLink } from '@angular/router'
import { TaglistComponent } from '../taglist/taglist.component'
import { AsyncPipe } from '@angular/common'
import { TruncatePipe } from '../../pipes/truncate.pipe'

@Component({
  selector: 'app-collection-card',
  templateUrl: './collection-card.component.html',
  styleUrls: ['./collection-card.component.scss'],
  imports: [
    FocusRemoverDirective,
    RouterLink,
    TaglistComponent,
    AsyncPipe,
    TranslatePipe,
    TruncatePipe
  ]
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
