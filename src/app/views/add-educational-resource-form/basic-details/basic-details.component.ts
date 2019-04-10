import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import slugify from 'slugify';

import { KoodistoProxyService } from '../../../services/koodisto-proxy.service';

@Component({
  selector: 'app-basic-details',
  templateUrl: './basic-details.component.html',
})
export class BasicDetailsComponent implements OnInit {
  private localStorageKey = 'aoe.new-educational-resource';
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

  public basicDetailsForm = new FormGroup({
    image: new FormControl(''),
    file: new FormControl(''),
    link: new FormControl(''),
    name: new FormControl('', Validators.required),
    keywords: new FormControl('', Validators.required),
    author: new FormControl('', Validators.required),
    organisation: new FormControl(''),
    learningResourceType: new FormControl('', Validators.required),
    timeRequired: new FormControl(''),
    publisher: new FormControl(''),
    description: new FormControl(''),
  });

  constructor(
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.organisations$ = this.koodistoProxySvc.getData('organisaatiot', this.lang);

    this.learningResourceTypes$ = this.koodistoProxySvc.getData('oppimateriaalityypit', this.lang);

    this.koodistoProxySvc.getData('asiasanat', this.lang).subscribe(keywords => {
      this.keywords = keywords;
    });

    this.onSearch();
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
    console.warn(this.basicDetailsForm.value);

    const data = {
      id: 1337,
      materials: [],
      owner: {
        id: 12003,
        firstName: 'Matti',
        lastName: 'Meikäläinen'
      },
      name: [
        { lang: 'fi', text: this.basicDetailsForm.get('name').value },
      ],
      slug: [
        { lang: 'fi', text: slugify(this.basicDetailsForm.get('name').value, { lower: true }) },
      ],
      thumbnail: this.basicDetailsForm.get('image').value,
      createdAt: new Date(),
      updatedAt: null,
      publishedAt: null,
      archivedAt: null,
      author: this.basicDetailsForm.get('author').value,
      organisation: this.basicDetailsForm.get('organisation').value,
      publisher: this.basicDetailsForm.get('publisher').value,
      description: [
        { lang: 'fi', text: this.basicDetailsForm.get('description').value },
      ],
      keywords: this.basicDetailsForm.get('keywords').value,
      learningResourceType: [
        { id: 1234, value: 'audio' },
      ],
      timeRequired: this.basicDetailsForm.get('timeRequired').value,
    };

    localStorage.setItem(this.localStorageKey, JSON.stringify(data));
  }

  // @todo: some kind of confirmation
  resetForm() {
    // reset form values
    this.basicDetailsForm.reset();

    // clear data from local storage
    localStorage.removeItem(this.localStorageKey);
  }
}
