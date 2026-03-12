import { Component, OnInit } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { Title } from '@angular/platform-browser'
import { TermsOfUseComponent } from '../../components/terms-of-use/terms-of-use.component';

@Component({
    selector: 'app-terms-of-use-view',
    templateUrl: './terms-of-use-view.component.html',
    imports: [TermsOfUseComponent]
})
export class TermsOfUseViewComponent implements OnInit {
  constructor(
    private translate: TranslateService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.setTitle()

    this.translate.onLangChange.subscribe(() => {
      this.setTitle()
    })
  }

  setTitle(): void {
    this.translate
      .get(['common.serviceName', 'titles.termsOfUse'])
      .subscribe((translations: { [key: string]: string }) => {
        this.titleService.setTitle(
          `${translations['titles.termsOfUse']} - ${translations['common.serviceName']}`
        )
      })
  }
}
