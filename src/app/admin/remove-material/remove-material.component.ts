import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { ToastrService } from 'ngx-toastr';
import { validatorParams } from '../../constants/validator-params';
import { RemoveMaterialResponse } from '../../models/admin/remove-material-response';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MaterialInfoResponse } from '../../models/admin/material-info-response';

@Component({
  selector: 'app-admin-remove-material',
  templateUrl: './remove-material.component.html',
  styleUrls: ['./remove-material.component.scss']
})
export class RemoveMaterialComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  materialInfo: MaterialInfoResponse;
  materialInfoSubscription: Subscription;
  materialInfoSubject = new Subject<string>();

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

    this.materialInfoSubscription = this.adminSvc.materialInfo$.subscribe((response: MaterialInfoResponse) => {
      this.materialInfo = response;
    });

    this.materialInfoSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe((value: string) => this.adminSvc.updateMaterialInfo(value));
  }

  ngOnDestroy(): void {
    this.materialInfoSubscription.unsubscribe();
  }

  get materialIdCtrl(): FormControl {
    return this.form.get('materialId') as FormControl;
  }

  getMaterialInfo($event): void {
    const value = $event.target.value;

    if (this.materialIdCtrl.valid && value) {
      this.materialInfoSubject.next(value);
    } else {
      this.materialInfo = null;
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      this.adminSvc.removeMaterial(this.materialIdCtrl.value).subscribe(
        (response: RemoveMaterialResponse) => {
          if (response.status === 'success') {
            this.toastr.info('Materiaali arkistoitu onnistuneesti');
          } else {
            this.toastr.error('Materiaalia ei arkistoitu');
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
