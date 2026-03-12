import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'

import { AuthService } from '@services/auth.service'
import { Title } from '@angular/platform-browser'
import { TranslateService, TranslatePipe } from '@ngx-translate/core'
import { TermsOfUseComponent } from '../../components/terms-of-use/terms-of-use.component'
import { PrivacyPolicyComponent } from '../../components/privacy-policy/privacy-policy.component'
import { FocusRemoverDirective } from '../../directives/focus-remover.directive'

@Component({
  selector: 'app-acceptance-view',
  templateUrl: './acceptance-view.component.html',
  imports: [
    TermsOfUseComponent,
    PrivacyPolicyComponent,
    ReactiveFormsModule,
    FocusRemoverDirective,
    TranslatePipe
  ]
})
export class AcceptanceViewComponent implements OnInit {
  public acceptanceForm: FormGroup

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private titleService: Title,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.setTitle()

    this.translate.onLangChange.subscribe(() => {
      this.setTitle()
    })

    this.acceptanceForm = this.fb.group({
      acceptance: this.fb.control(false, [Validators.requiredTrue])
    })
  }

  setTitle(): void {
    this.translate
      .get(['common.serviceName', 'titles.acceptance'])
      .subscribe((translations: { [key: string]: string }) => {
        this.titleService.setTitle(
          `${translations['titles.acceptance']} - ${translations['common.serviceName']}`
        )
      })
  }

  public onSubmit(): void {
    this.authService.updateAcceptance()
  }
}
