import { Component, OnDestroy, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { AoeUser } from '../../models/admin/aoe-users-response';
import { Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { validatorParams } from '../../constants/validator-params';
import { ChangeOwnerPost } from '../../models/admin/change-owner-post';
import { ChangeOwnerResponse } from '../../models/admin/change-owner-response';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-change-material-owner',
  templateUrl: './change-material-owner.component.html',
  styleUrls: ['./change-material-owner.component.scss']
})
export class ChangeMaterialOwnerComponent implements OnInit, OnDestroy {
  users: AoeUser[];
  userSubscription: Subscription;
  form: FormGroup;
  submitted: boolean;

  constructor(
    private adminSvc: AdminService,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.userSubscription = this.adminSvc.users$.subscribe((users: AoeUser[]) => {
      this.users = users;
    });
    this.adminSvc.updateUsers();

    this.form = this.fb.group({
      materialId: this.fb.control(null, [
        Validators.required,
        Validators.pattern(validatorParams.common.pattern.numeric),
      ]),
      userId: this.fb.control(null, [
        Validators.required,
      ]),
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  get materialIdCtrl(): FormControl {
    return this.form.get('materialId') as FormControl;
  }

  get userIdCtrl(): FormControl {
    return this.form.get('userId') as FormControl;
  }

  /**
   * Custom search for user.
   * @param {string} term
   * @param {AoeUser} user
   */
  userSearch(term: string, user: AoeUser) {
    term = term.toLowerCase();

    return user.id === term
      || user.firstname.toLowerCase().indexOf(term) > -1
      || user.lastname.toLowerCase().indexOf(term) > -1
      || user.email?.toLowerCase().indexOf(term) > -1;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      const payload: ChangeOwnerPost = {
        userid: this.userIdCtrl.value,
        materialid: this.materialIdCtrl.value,
      };

      this.adminSvc.changeMaterialOwner(payload).subscribe(
        (response: ChangeOwnerResponse) => {
          if (response.status === 'success') {
            this.toastr.success('Omistaja vaihdettu onnistuneesti');
          } else {
            this.toastr.error('Omistajaa ei vaihdettu');
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
