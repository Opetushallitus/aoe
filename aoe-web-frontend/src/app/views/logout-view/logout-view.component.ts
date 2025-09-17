import { Component, OnInit } from '@angular/core'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'
import { Title } from '@angular/platform-browser'

@Component({
  selector: 'app-logout-view',
  templateUrl: './logout-view.component.html'
})
export class LogoutViewComponent implements OnInit {
  lang: string = this.translate.currentLang
  serviceName: string

  constructor(
    private translate: TranslateService,
    private titleService: Title
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
      .get(['common.serviceName', 'titles.logout'])
      .subscribe((translations: { [key: string]: string }) => {
        this.titleService.setTitle(
          `${translations['titles.logout']} - ${translations['common.serviceName']}`
        )
      })
  }
}
