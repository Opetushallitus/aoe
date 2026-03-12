import { Component, OnInit } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { TranslateService } from '@ngx-translate/core'
import { PrivacyPolicyComponent } from '../../components/privacy-policy/privacy-policy.component'

@Component({
  selector: 'app-privacy-policy-view',
  templateUrl: './privacy-policy-view.component.html',
  imports: [PrivacyPolicyComponent]
})
export class PrivacyPolicyViewComponent implements OnInit {
  serviceName: string
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
      .get(['common.serviceName', 'titles.privacy'])
      .subscribe((translations: { [key: string]: string }) => {
        this.titleService.setTitle(
          `${translations['titles.privacy']} - ${translations['common.serviceName']}`
        )
      })
  }
}
