import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { KeyValue } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';

import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';
import { getLocalStorageData, addCustomItem } from '../../../../shared/shared.module';

@Component({
  selector: 'app-tabs-basic-details',
  templateUrl: './basic-details.component.html',
})
export class BasicDetailsComponent implements OnInit {
  private localStorageKey = 'aoe.new-educational-resource';
  private lang: string = this.translate.currentLang;
  private savedData: any;

  public learningResourceTypes$: KeyValue<string, string>[];
  public educationalRoles$: KeyValue<string, string>[];
  public educationalUse$: KeyValue<string, string>[];

  // https://stackblitz.com/edit/ng-select-infinite
  private keywords = [];
  public keywordsBuffer = [];
  private bufferSize = 50;
  public loadingKeywords = false;
  public keywordsInput$ = new Subject<string>();

  private organisations = [];
  public organisationsBuffer = [];
  public loadingOrganisations = false;
  public organisationsInput$ = new Subject<string>();

  public addCustomItem = addCustomItem;

  public modalRef: BsModalRef;

  public basicDetailsForm: FormGroup;

  constructor(
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.savedData = getLocalStorageData(this.localStorageKey);

    this.basicDetailsForm = this.fb.group({
      image: this.fb.control(null),
      keywords: this.fb.control(null, [ Validators.required ]),
      authors: this.fb.array([
        this.createAuthor(),
      ]),
      learningResourceType: this.fb.control(null, [ Validators.required ]),
      educationalRoles: this.fb.control(null),
      educationalUse: this.fb.control(null),
      description: this.fb.group({
        fi: this.fb.control(null),
        sv: this.fb.control(null),
        en: this.fb.control(null),
      }),
    });

    this.koodistoProxySvc.getData('oppimateriaalityypit', this.lang).subscribe(data => {
      this.learningResourceTypes$ = data;
    });

    this.koodistoProxySvc.getData('kohderyhmat', this.lang).subscribe(data => {
      this.educationalRoles$ = data;
    });

    this.koodistoProxySvc.getData('kayttokohteet', this.lang).subscribe(data => {
      this.educationalUse$ = data;
    });

    this.koodistoProxySvc.getData('asiasanat', this.lang).subscribe(keywords => {
      this.keywords = keywords;
    });

    this.onKeywordsSearch();
    this.onOrganisationsSearch();

    if (this.savedData) {
      if (this.savedData.keywords) {
        this.basicDetailsForm.get('keywords').setValue(this.savedData.keywords);
      }

      if (this.savedData.learningResourceType) {
        this.basicDetailsForm.get('learningResourceType').setValue(this.savedData.learningResourceType);
      }

      if (this.savedData.educationalRoles) {
        this.basicDetailsForm.get('educationalRoles').setValue(this.savedData.educationalRoles);
      }

      if (this.savedData.educationalUse) {
        this.basicDetailsForm.get('educationalUse').setValue(this.savedData.educationalUse);
      }

      if (this.savedData.description) {
        this.basicDetailsForm.get('description').setValue(this.savedData.description);
      }

      if (this.savedData.authors) {
        if (this.savedData.authors.length > 0) {
          this.removeAuthor(0);
        }

        this.savedData.authors.forEach(author => {
          this.authors.push(this.createAuthor(author));
        });
      }
    }
  }

  get form() {
    return this.basicDetailsForm.controls;
  }

  public fetchMoreKeywords(value: string) {
    const len = this.keywordsBuffer.length;
    const more = this.keywords
      .filter(x => x.value.includes(value))
      .slice(len, this.bufferSize + len);

    this.loadingKeywords = true;

    setTimeout(() => {
      this.loadingKeywords = false;
      this.keywordsBuffer = this.keywordsBuffer.concat(more);
    }, 200);
  }

  private onKeywordsSearch() {
    this.keywordsInput$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(value => this.fakeKeywordsService(value))
    ).subscribe(data => {
      this.keywordsBuffer = data.slice(0, this.bufferSize);
    });
  }

  private fakeKeywordsService(value: string) {
    return this.koodistoProxySvc.getData('asiasanat', this.lang)
      .pipe(map(data => data.filter((x: { value: string }) => x.value.includes(value))));
  }

  public fetchMoreOrganisations(value: string) {
    const len = this.organisationsBuffer.length;
    const more = this.organisations
      .filter(x => x.value.includes(value))
      .slice(len, this.bufferSize + len);

    this.loadingOrganisations = true;

    setTimeout(() => {
      this.loadingOrganisations = false;
      this.organisationsBuffer = this.organisationsBuffer.concat(more);
    }, 200);
  }

  private onOrganisationsSearch() {
    this.organisationsInput$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(value => this.fakeOrganisationsService(value))
    ).subscribe(data => {
      this.organisationsBuffer = data.slice(0, this.bufferSize);
    });
  }

  private fakeOrganisationsService(value: string) {
    return this.koodistoProxySvc.getData('organisaatiot', this.lang)
      .pipe(map(data => data.filter((x: { value: string }) => x.value.includes(value))));
  }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-dialog-centered' })
    );
  }

  get authors() {
    return this.basicDetailsForm.get('authors') as FormArray;
  }

  public createAuthor(author?): FormGroup {
    return this.fb.group({
      author: this.fb.control(author ? author.author : null, [ Validators.required ]),
      organisation: this.fb.control(author ? author.organisation : null),
    });
  }

  public addAuthor() {
    this.authors.push(this.createAuthor());
  }

  public removeAuthor(i: number): void {
    this.authors.removeAt(i);
  }

  public onSubmit() {
    if (this.basicDetailsForm.valid) {
      const data = Object.assign({}, getLocalStorageData(this.localStorageKey), this.basicDetailsForm.value);

      // save data to local storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));

      this.router.navigate(['/lisaa-oppimateriaali', 3]);
    } else {
      return;
    }
  }

  // @todo: some kind of confirmation
  public resetForm() {
    // reset form values
    this.basicDetailsForm.reset();

    // clear data from local storage
    localStorage.removeItem(this.localStorageKey);
  }

  public previousTab() {
    this.router.navigate(['/lisaa-oppimateriaali', 1]);
  }
}
