import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  public submitted = false;
  public selectedLang = 'en';
  private lang: string = this.translate.currentLang;

  public organisations$: Observable<any>;
  public learningResourceTypes$: Observable<any>;

  // https://stackblitz.com/edit/ng-select-infinite
  private keywords = [];
  public keywordsBuffer = [];
  private bufferSize = 50;
  public loading = false;
  public input$ = new Subject<string>();

  public modalRef: BsModalRef;

  public basicDetailsForm: FormGroup;

  private formData = JSON.parse(localStorage.getItem(this.localStorageKey));

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
      name: this.fb.control(null, Validators.required),
      nameEn: this.fb.control(null),
      nameSv: this.fb.control(null),
      keywords: this.fb.control(null, Validators.required),
      author: this.fb.control(null, Validators.required),
      organisation: this.fb.control(null),
      learningResourceType: this.fb.control(null, Validators.required),
      timeRequired: this.fb.control(null),
      publisher: this.fb.control(null),
      description: this.fb.control(null),
      descriptionEn: this.fb.control(null),
      descriptionSv: this.fb.control(null),
    });

    this.organisations$ = this.koodistoProxySvc.getData('organisaatiot', this.lang);

    this.learningResourceTypes$ = this.koodistoProxySvc.getData('oppimateriaalityypit', this.lang);

    this.koodistoProxySvc.getData('asiasanat', this.lang).subscribe(keywords => {
      this.keywords = keywords;
    });

    this.onSearch();

    if (this.formData) {
      const name = this.formData.name.find(e => e.lang === 'fi');
      const nameEn = this.formData.name.find(e => e.lang === 'en');
      const nameSv = this.formData.name.find(e => e.lang === 'sv');

      const description = this.formData.description.find(e => e.lang === 'fi');
      const descriptionEn = this.formData.description.find(e => e.lang === 'en');
      const descriptionSv = this.formData.description.find(e => e.lang === 'sv');

      this.basicDetailsForm.get('name').setValue(name.text);
      this.basicDetailsForm.get('nameEn').setValue(nameEn.text);
      this.basicDetailsForm.get('nameSv').setValue(nameSv.text);
      this.basicDetailsForm.get('keywords').setValue(this.formData.keywords);
      this.basicDetailsForm.get('author').setValue(this.formData.author);
      this.basicDetailsForm.get('organisation').setValue(this.formData.organisation);
      this.basicDetailsForm.get('learningResourceType').setValue(this.formData.learningResourceType);
      this.basicDetailsForm.get('timeRequired').setValue(this.formData.timeRequired);
      this.basicDetailsForm.get('publisher').setValue(this.formData.publisher);
      this.basicDetailsForm.get('description').setValue(description.text);
      this.basicDetailsForm.get('descriptionEn').setValue(descriptionEn.text);
      this.basicDetailsForm.get('descriptionSv').setValue(descriptionSv.text);
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

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-dialog-centered' })
    );
  }

  onSubmit() {
    this.submitted = true;

    if (!this.basicDetailsForm.invalid) {
      const data = {
        name: [
          { lang: 'fi', text: this.basicDetailsForm.get('name').value },
          { lang: 'en', text: this.basicDetailsForm.get('nameEn').value },
          { lang: 'sv', text: this.basicDetailsForm.get('nameSv').value },
        ],
        thumbnail: this.basicDetailsForm.get('image').value,
        createdAt: new Date(),
        author: this.basicDetailsForm.get('author').value,
        organisation: this.basicDetailsForm.get('organisation').value,
        publisher: this.basicDetailsForm.get('publisher').value,
        description: [
          { lang: 'fi', text: this.basicDetailsForm.get('description').value },
          { lang: 'en', text: this.basicDetailsForm.get('descriptionEn').value },
          { lang: 'sv', text: this.basicDetailsForm.get('descriptionSv').value },
        ],
        keywords: this.basicDetailsForm.get('keywords').value,
        learningResourceType: this.basicDetailsForm.get('learningResourceType').value,
        timeRequired: this.basicDetailsForm.get('timeRequired').value,
      };

      // save data to local storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));

      this.tabs.tabs[2].active = true;
    } else {
      return;
    }
  }

  // @todo: some kind of confirmation
  resetForm() {
    // reset form values
    this.basicDetailsForm.reset();

    // clear data from local storage
    localStorage.removeItem(this.localStorageKey);
  }

  previousTab() {
    this.tabs.tabs[0].active = true;
  }
}
