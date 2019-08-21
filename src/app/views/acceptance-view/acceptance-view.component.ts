import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-acceptance-view',
  templateUrl: './acceptance-view.component.html',
})
export class AcceptanceViewComponent implements OnInit {
  public acceptanceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authSvc: AuthService
  ) { }

  ngOnInit(): void {
    this.acceptanceForm = this.fb.group({
      acceptance: this.fb.control(false, [Validators.requiredTrue]),
    });
  }

  public onSubmit() {
    this.authSvc.updateAcceptance(this.acceptanceForm.get('acceptance').value);

    this.router.navigate(['/etusivu']);
  }
}
