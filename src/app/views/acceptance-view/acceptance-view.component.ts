import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '@services/auth.service';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-acceptance-view',
  templateUrl: './acceptance-view.component.html',
})
export class AcceptanceViewComponent implements OnInit {
  public acceptanceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authSvc: AuthService,
    private titleSvc: Title,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.setTitle();

    this.translate.onLangChange.subscribe(() => {
      this.setTitle();
    });

    this.acceptanceForm = this.fb.group({
      acceptance: this.fb.control(false, [ Validators.requiredTrue ]),
    });
  }

  setTitle(): void {
    this.translate.get('titles.acceptance').subscribe((title: string) => {
      this.titleSvc.setTitle(`${title} ${environment.title}`);
    });
  }

  public onSubmit() {
    this.authSvc.updateAcceptance();
  }
}
