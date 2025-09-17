import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'

import { AuthService } from '@services/auth.service'
import { Title } from '@angular/platform-browser'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'app-acceptance-view',
  templateUrl: './acceptance-view.component.html'
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
