import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { ToastrService } from 'ngx-toastr';
import { validatorParams } from '../../constants/validator-params';
import { RemoveMaterialResponse } from '../../models/admin/remove-material-response';

@Component({
  selector: 'app-admin-remove-material',
  templateUrl: './remove-material.component.html',
  styleUrls: ['./remove-material.component.scss']
})
export class RemoveMaterialComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;

  constructor(
    private adminSvc: AdminService,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      materialId: this.fb.control(null, [
        Validators.required,
        Validators.pattern(validatorParams.common.pattern.numeric),
      ]),
    });
  }

  get materialIdCtrl(): FormControl {
    return this.form.get('materialId') as FormControl;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      this.adminSvc.removeMaterial(this.materialIdCtrl.value).subscribe(
        (response: RemoveMaterialResponse) => {
          if (response.status === 'success') {
            this.toastr.info('Materiaali poistettu onnistuneesti');
          } else {
            this.toastr.error('Materiaalia ei poistettu');
          }
        },
        (err) => {
          this.toastr.error(err);
        },
        () => {
          this.form.reset();
          this.submitted = false;
        },
      );
    }
  }
}
