import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { TabsetComponent } from 'ngx-bootstrap';

import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';

@Component({
  selector: 'app-tabs-based-on-details',
  templateUrl: './based-on-details.component.html',
})
export class BasedOnDetailsComponent implements OnInit {
  @Input() tabs: TabsetComponent;

  private localStorageKey = 'aoe.new-educational-resource';
  private lang: string = this.translate.currentLang;
  private savedData = JSON.parse(localStorage.getItem(this.localStorageKey));

  public basedOnDetailsForm: FormGroup;

  constructor(
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.basedOnDetailsForm = this.fb.group({
      internals: this.fb.array([ this.createInternal() ]),
      externals: this.fb.array([ this.createExternal() ]),
    });

    if (this.savedData && this.savedData.isBasedOn) {
      if (this.savedData.isBasedOn.internals.length > 0) {
        this.basedOnDetailsForm.get('internals').setValue(this.savedData.isBasedOn.internals);
      }

      if (this.savedData.isBasedOn.externals.length > 0) {
        this.basedOnDetailsForm.get('externals').setValue(this.savedData.isBasedOn.externals);
      }
    }
  }

  get internals() {
    return this.basedOnDetailsForm.get('internals') as FormArray;
  }

  get externals() {
    return this.basedOnDetailsForm.get('externals') as FormArray;
  }

  private createInternal(): FormGroup {
    return this.fb.group({
      author: this.fb.control(null),
      materialId: this.fb.control(null),
    });
  }

  private createExternal(): FormGroup {
    return this.fb.group({
      author: this.fb.control(null),
      url: this.fb.control(null),
      name: this.fb.control(null),
    });
  }

  public addInternal(): void {
    this.internals.push(this.createInternal());
  }

  public addExternal(): void {
    this.externals.push(this.createExternal());
  }

  public removeInternal(i: number): void {
    this.internals.removeAt(i);
  }

  public removeExternal(i: number): void {
    this.externals.removeAt(i);
  }

  public onSubmit() {
    if (this.basedOnDetailsForm.valid) {
      this.basedOnDetailsForm.get('internals').value.forEach((row, index) => {
        if (row.author === null || row.materialId === null) {
          this.removeInternal(index);
        }
      });

      this.basedOnDetailsForm.get('externals').value.forEach((row, index) => {
        if (row.author === null || row.url === null) {
          this.removeExternal(index);
        }
      });

      const basedOnData = {
        isBasedOn: {
          internals: this.basedOnDetailsForm.get('internals').value,
          externals: this.basedOnDetailsForm.get('externals').value,
        },
      };

      const data = Object.assign({}, this.savedData, basedOnData);

      // save data to local storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));
    }
  }

  // @todo: some kind of confirmation
  public resetForm() {
    // reset form values
    this.basedOnDetailsForm.reset();

    // clear data from local storage
    localStorage.removeItem(this.localStorageKey);
  }

  public previousTab() {
    this.tabs.tabs[3].active = true;
  }
}
