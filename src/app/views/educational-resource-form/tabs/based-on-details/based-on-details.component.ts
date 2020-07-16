import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { environment } from '../../../../../environments/environment';
import { Title } from '@angular/platform-browser';
import { textInputValidator } from '../../../../shared/shared.module';
import { validatorParams } from '../../../../constants/validator-params';

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
  submitted = false;

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private router: Router,
    private titleSvc: Title,
  ) { }

  ngOnInit() {
    this.setTitle();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.setTitle();
    });

    this.savedData = JSON.parse(sessionStorage.getItem(this.savedDataKey));

    this.basedOnDetailsForm = this.fb.group({
      // internals: this.fb.array([ this.createInternal() ]),
      externals: this.fb.array([ this.createExternal() ]),
    });

    if (this.savedData && this.savedData.isBasedOn) {
      if (this.savedData.isBasedOn.externals.length > 0) {
        this.removeExternal(0);

        this.savedData.isBasedOn.externals.forEach(external => {
          this.externals.push(this.createExternal(external));
        });
      }
    }
  }

  setTitle(): void {
    this.translate.get('titles.addMaterial').subscribe((translations: any) => {
      this.titleSvc.setTitle(`${translations.main}: ${translations.references} ${environment.title}`);
    });
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

  createExternal(external?): FormGroup {
    return this.fb.group({
      author: this.fb.control(external ? external.author : null, [
        Validators.required,
        textInputValidator(),
      ]),
      url: this.fb.control(external ? external.url : null, [
        Validators.required,
        Validators.pattern(validatorParams.reference.url.pattern),
        Validators.maxLength(validatorParams.reference.url.maxLength),
      ]),
      name: this.fb.control(external ? external.name : null, [
        Validators.required,
        Validators.maxLength(validatorParams.reference.name.maxLength),
        textInputValidator(),
      ]),
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

  validateExternals(): void {
    this.externals.controls.forEach(ctrl => {
      const author = ctrl.get('author');
      const url = ctrl.get('url');
      const name = ctrl.get('name');

      if (!author.value && !url.value && !name.value) {
        this.removeExternal(this.externals.controls.findIndex(ext => ext === ctrl));
      }
    });
  }

  onSubmit() {
    this.submitted = true;

    this.validateExternals();

    if (this.basedOnDetailsForm.valid) {
      const basedOnData = {
        isBasedOn: {
          // internals: this.basedOnDetailsForm.get('internals').value,
          externals: this.basedOnDetailsForm.get('externals').value,
        },
      };

      const data = Object.assign(
        {},
        JSON.parse(sessionStorage.getItem(this.savedDataKey)),
        basedOnData,
      );

      // save data to session storage
      sessionStorage.setItem(this.savedDataKey, JSON.stringify(data));

      this.router.navigate(['/lisaa-oppimateriaali', 7]);
    }
  }

  // @todo: some kind of confirmation
  resetForm() {
    // reset submit status
    this.submitted = false;

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
