import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  }

  setTitle(): void {
    this.translate.get('titles.userDetails').subscribe((title: string) => {
      this.titleSvc.setTitle(`${title} ${environment.title}`);
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      // @todo: replace with actual functionality
      console.log(this.form.value);
    }
  }
}
