import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { setAcceptance } from '../../shared/shared.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acceptance-view',
  templateUrl: './acceptance-view.component.html',
})
export class AcceptanceViewComponent implements OnInit {
  public acceptanceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.acceptanceForm = this.fb.group({
      acceptance: this.fb.control(false, [Validators.requiredTrue]),
    });
  }

  public onSubmit() {
    setAcceptance(this.acceptanceForm.get('acceptance').value);

    this.router.navigate(['/etusivu']);
  }
}
