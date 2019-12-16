import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { environment } from '../../../../../environments/environment';
import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';
import { addCustomItem } from '../../../../shared/shared.module';

@Component({
  selector: 'app-tabs-based-on-details',
  templateUrl: './based-on-details.component.html',
})
export class BasedOnDetailsComponent implements OnInit {
  private savedDataKey = environment.newERLSKey;
  private fileUploadLSKey = environment.fileUploadLSKey;
  lang: string = this.translate.currentLang;
  savedData: any;

  basedOnDetailsForm: FormGroup;
  addCustomItem = addCustomItem;

  constructor(
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.savedData = JSON.parse(sessionStorage.getItem(this.savedDataKey));

    this.basedOnDetailsForm = this.fb.group({
      // internals: this.fb.array([ this.createInternal() ]),
      externals: this.fb.array([ this.createExternal() ]),
    });

    if (this.savedData && this.savedData.isBasedOn) {
      /*if (this.savedData.isBasedOn.internals.length > 0) {
        this.basedOnDetailsForm.get('internals').setValue(this.savedData.isBasedOn.internals);
      }*/

      if (this.savedData.isBasedOn.externals.length > 0) {
        this.basedOnDetailsForm.get('externals').setValue(this.savedData.isBasedOn.externals);
      }
    }
  }

  /*get internals() {
    return this.basedOnDetailsForm.get('internals') as FormArray;
  }*/

  get externals() {
    return this.basedOnDetailsForm.get('externals') as FormArray;
  }

  /*createInternal(): FormGroup {
    return this.fb.group({
      author: this.fb.control(null),
      materialId: this.fb.control(null),
    });
  }*/

  createExternal(): FormGroup {
    return this.fb.group({
      author: this.fb.control(null),
      url: this.fb.control(null),
      name: this.fb.control(null),
    });
  }

  /*addInternal(): void {
    this.internals.push(this.createInternal());
  }*/

  addExternal(): void {
    this.externals.push(this.createExternal());
  }

  /*removeInternal(i: number): void {
    this.internals.removeAt(i);
  }*/

  removeExternal(i: number): void {
    this.externals.removeAt(i);
  }

  onSubmit() {
    if (this.basedOnDetailsForm.valid) {
      /*this.basedOnDetailsForm.get('internals').value.forEach((row, index) => {
        if (row.author === null || row.materialId === null) {
          this.removeInternal(index);
        }
      });*/

      this.basedOnDetailsForm.get('externals').value.forEach((row, index) => {
        if (row.author === null || row.url === null) {
          this.removeExternal(index);
        }
      });

      const basedOnData = {
        isBasedOn: {
          // internals: this.basedOnDetailsForm.get('internals').value,
          externals: this.basedOnDetailsForm.get('externals').value,
        },
      };

      const data = Object.assign(
        {},
        JSON.parse(sessionStorage.getItem(this.savedDataKey)),
        basedOnData
      );

      // save data to session storage
      sessionStorage.setItem(this.savedDataKey, JSON.stringify(data));

      this.router.navigate(['/lisaa-oppimateriaali', 7]);
    }
  }

  // @todo: some kind of confirmation
  resetForm() {
    // reset form values
    this.basedOnDetailsForm.reset();

    // clear data from session storage
    sessionStorage.removeItem(this.savedDataKey);
    sessionStorage.removeItem(this.fileUploadLSKey);

    this.router.navigateByUrl('/');
  }

  previousTab() {
    this.router.navigate(['/lisaa-oppimateriaali', 2]);
  }
}
