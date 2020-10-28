import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { UserSettings } from '@models/users/user-settings';
import { Userdata } from '@models/userdata';

@Component({
  selector: 'app-user-details-view',
  templateUrl: './user-details-view.component.html',
  styleUrls: ['./user-details-view.component.scss']
})
export class UserDetailsViewComponent implements OnInit {
  submitted: boolean;
  form: FormGroup;

  constructor(
    private translate: TranslateService,
    private titleSvc: Title,
    private fb: FormBuilder,
    public authSvc: AuthService,
  ) { }

  ngOnInit(): void {
    this.setTitle();

    this.form = this.fb.group({
      notifications: this.fb.group({
        newRatings: this.fb.control(false),
        almostExpired: this.fb.control(false),
        termsUpdated: this.fb.control(false),
      }),
      email: this.fb.control(null, [
        Validators.required,
        Validators.email,
      ]),
      allowTransfer: this.fb.control(false),
    });

    if (this.authSvc.hasUserdata()) {
      const userData: Userdata = this.authSvc.getUserdata();
      const userSettings: UserSettings = {
        notifications: {
          newRatings: userData.newRatings,
          almostExpired: userData.almostExpired,
          termsUpdated: userData.termsUpdated,
        },
        email: userData.email,
        allowTransfer: userData.allowTransfer,
      };

      this.form.patchValue(userSettings);
    }
  }

  setTitle(): void {
    this.translate.get('titles.userDetails').subscribe((title: string) => {
      this.titleSvc.setTitle(`${title} ${environment.title}`);
    });
  }

  get emailCtrl(): FormControl {
    return this.form.get('email') as FormControl;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      const userSettings: UserSettings = this.form.value;

      if (this.authSvc.getUserdata().email === userSettings.email) {
        delete userSettings.email;
      }

      this.authSvc.updateUserSettings(userSettings).subscribe(
        () => {
          this.form.markAsPristine();
          this.authSvc.setUserdata().subscribe();
        },
        (err) => console.error(err),
      );
    }
  }
}
