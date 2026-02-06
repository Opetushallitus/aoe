import { Component, OnInit } from '@angular/core'
import { KoodistoService } from '@services/koodisto.service'
import { Title } from '@angular/platform-browser'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'
import { AccessibilityTable } from '@models/mocks/accessibility-table'
import { Accessibility } from '../../mocks/accessibility.mock'

@Component({
  selector: 'app-accessibility-view',
  templateUrl: './accessibility-view.component.html',
  styleUrls: ['./accessibility-view.component.scss'],
  standalone: false
})
export class AccessibilityViewComponent implements OnInit {
  lang: string = this.translate.currentLang
  accessibilityTable: AccessibilityTable = Accessibility

  constructor(
    private titleService: Title,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.setTitle()

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang

      this.setTitle()
    })
  }

  setTitle(): void {
    this.translate
      .get(['common.serviceName', 'titles.accessibility'])
      .subscribe((translations: { [key: string]: string }) => {
        this.titleService.setTitle(
          `${translations['titles.accessibility']} - ${translations['common.serviceName']}`
        )
      })
  }
}
