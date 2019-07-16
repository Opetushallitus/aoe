import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef, TabsetComponent } from 'ngx-bootstrap';

import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';

@Component({
  selector: 'app-tabs-basic-details',
  templateUrl: './basic-details.component.html',
})
export class BasicDetailsComponent implements OnInit {
  @Input() tabs: TabsetComponent;

  private localStorageKey = 'aoe.new-educational-resource';
  private lang: string = this.translate.currentLang;
  private savedData = JSON.parse(localStorage.getItem(this.localStorageKey));

  public organisations$: Observable<any>;
  public learningResourceTypes$: Observable<any>;
  public educationalRoles$: Observable<any>;
  public educationalUse$: Observable<any>;

  // https://stackblitz.com/edit/ng-select-infinite
  private keywords = [];
  public keywordsBuffer = [];
  private bufferSize = 50;
  public loading = false;
  public input$ = new Subject<string>();

  public modalRef: BsModalRef;

  public basicDetailsForm: FormGroup;

  constructor(
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

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

    this.organisations$ = this.koodistoProxySvc.getData('organisaatiot', this.lang);
    this.learningResourceTypes$ = this.koodistoProxySvc.getData('oppimateriaalityypit', this.lang);
    this.educationalRoles$ = this.koodistoProxySvc.getData('kohderyhmat', this.lang);
    this.educationalUse$ = this.koodistoProxySvc.getData('kayttokohteet', this.lang);

    this.koodistoProxySvc.getData('asiasanat', this.lang).subscribe(keywords => {
      this.keywords = keywords;
    });

    this.onSearch();

    if (this.savedData) {
      this.basicDetailsForm.get('keywords').setValue(this.savedData.keywords);
      this.basicDetailsForm.get('learningResourceType').setValue(this.savedData.learningResourceType);
      this.basicDetailsForm.get('educationalRoles').setValue(this.savedData.educationalRole);
      this.basicDetailsForm.get('educationalUse').setValue(this.savedData.educationalUse);
      this.basicDetailsForm.get('description').setValue(this.savedData.description);

      if (this.savedData.authors) {
        if (this.savedData.authors.length > 0) {
          this.removeAuthor(0);
        }

        this.savedData.authors.forEach(row => {
          this.authors.push(this.createAuthor(row));
        });
      }
    }
  }

  get form() {
    return this.basicDetailsForm.controls;
  }

  public fetchMore(value: string) {
    const len = this.keywordsBuffer.length;
    const more = this.keywords
      .filter(x => x.value.includes(value))
      .slice(len, this.bufferSize + len);

    this.loading = true;

    setTimeout(() => {
      this.loading = false;
      this.keywordsBuffer = this.keywordsBuffer.concat(more);
    }, 200);
  }

  private onSearch() {
    this.input$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(value => this.fakeService(value))
    ).subscribe(data => {
      this.keywordsBuffer = data.slice(0, this.bufferSize);
    });
  }

  private fakeService(value: string) {
    return this.koodistoProxySvc.getData('asiasanat', this.lang)
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
      const newData = {
        thumbnail: this.basicDetailsForm.get('image').value,
        authors: this.basicDetailsForm.get('authors').value,
        description: this.basicDetailsForm.get('description').value,
        keywords: this.basicDetailsForm.get('keywords').value,
        learningResourceType: this.basicDetailsForm.get('learningResourceType').value,
        educationalRole: this.basicDetailsForm.get('educationalRoles').value,
        educationalUse: this.basicDetailsForm.get('educationalUse').value,
      };

      const data = Object.assign({}, this.savedData, newData);

      // save data to local storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));

      this.tabs.tabs[2].active = true;
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

  previousTab() {
    this.tabs.tabs[0].active = true;
  }
}
