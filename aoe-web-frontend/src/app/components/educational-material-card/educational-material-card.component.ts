import { Component, Input, OnInit } from '@angular/core'
import { LangChangeEvent, TranslateService, TranslatePipe } from '@ngx-translate/core'

import { EducationalMaterialCard } from '@models/educational-material-card'
import { getValuesWithinLimits } from '../../shared/shared.module'
import { Keyword } from '@models/keyword'
import { EducationalLevel } from '@models/educational-level'
import { FocusRemoverDirective } from '../../directives/focus-remover.directive';
import { RouterLink } from '@angular/router';
import { TaglistComponent } from '../taglist/taglist.component';
import { TruncatePipe } from '../../pipes/truncate.pipe';

@Component({
    selector: 'app-educational-material-card',
    templateUrl: './educational-material-card.component.html',
    styleUrls: ['./educational-material-card.component.scss'],
    imports: [FocusRemoverDirective, RouterLink, TaglistComponent, TranslatePipe, TruncatePipe]
})
export class EducationalMaterialCardComponent implements OnInit {
  @Input() educationalMaterial: EducationalMaterialCard
  lang: string = this.translate.getCurrentLang()

  materialName: string
  description: string
  keywords: Keyword[]
  educationalLevels: EducationalLevel[]

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang
    })

    this.keywords = getValuesWithinLimits(this.educationalMaterial.keywords, 'value')
    this.educationalLevels = getValuesWithinLimits(
      this.educationalMaterial.educationalLevels,
      'value'
    )
  }
}
