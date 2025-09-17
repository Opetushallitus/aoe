import { Component, OnDestroy, OnInit } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { Title } from '@angular/platform-browser'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { AuthService } from '@services/auth.service'
import { UserSettings } from '@models/users/user-settings'
import { UserData } from '@models/userdata'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-user-details-view',
  templateUrl: './user-details-view.component.html',
  styleUrls: ['./user-details-view.component.scss']
})
export class UserDetailsViewComponent implements OnDestroy, OnInit {
  submitted: boolean
  form: FormGroup
  userData: UserData
  userDataSubscription: Subscription

  constructor(
    private translate: TranslateService,
    private titleService: Title,
    private fb: FormBuilder,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.setTitle()

    this.userDataSubscription = this.authService.userData$.subscribe((userData: UserData) => {
      this.userData = userData
    })

    this.form = this.fb.group({
      notifications: this.fb.group({
        newRatings: this.fb.control(false),
        almostExpired: this.fb.control(false),
        termsUpdated: this.fb.control(false)
      }),
      email: this.fb.control(null, [Validators.required, Validators.email]),
      allowTransfer: this.fb.control(false)
    })

    if (this.userData) {
      const userSettings: UserSettings = {
        notifications: {
          newRatings: this.userData.newRatings,
          almostExpired: this.userData.almostExpired,
          termsUpdated: this.userData.termsUpdated
        },
        email: this.userData.email,
        allowTransfer: this.userData.allowTransfer
      }
      this.form.patchValue(userSettings)
    }
  }

  setTitle(): void {
    this.translate
      .get(['common.serviceName', 'titles.userDetails'])
      .subscribe((translations: { [key: string]: string }) => {
        this.titleService.setTitle(
          `${translations['titles.userDetails']} - ${translations['common.serviceName']}`
        )
      })
  }

  get emailCtrl(): FormControl {
    return this.form.get('email') as FormControl
  }

  onSubmit(): void {
    this.submitted = true

    if (this.form.valid) {
      const userSettings: UserSettings = this.form.value

      if (this.authService.getUserData()?.email === userSettings.email) {
        delete userSettings.email
      }

      this.authService.updateUserSettings(userSettings).subscribe(
        () => {
          this.form.markAsPristine()
          this.authService.removeUserData().then()
          this.authService.updateUserData().subscribe()
        },
        (err) => console.error(err)
      )
    }
  }

  ngOnDestroy(): void {
    this.userDataSubscription.unsubscribe()
  }
}
