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
  private lang: string = this.translate.currentLang;
  public organisations$: Observable<any>;

  // https://stackblitz.com/edit/ng-select-infinite
  private keywords = [];
  public keywordsBuffer = [];
  private bufferSize = 50;
  public loading = false;
  public input$ = new Subject<string>();

  public modalRef: BsModalRef;

  private formData = JSON.parse(localStorage.getItem('aoe.new-educational-resource'));

  public basicDetailsForm = new FormGroup({
    image: new FormControl(this.formData.image),
    file: new FormControl(this.formData.file),
    link: new FormControl(this.formData.link),
    name: new FormControl(this.formData.name[0].text, Validators.required),
    keywords: new FormControl(this.formData.keywords, Validators.required),
    author: new FormControl(this.formData.author, Validators.required),
    organisation: new FormControl(this.formData.organisation),
    learningResourceType: new FormControl(this.formData.learningResourceType, Validators.required),
    timeRequired: new FormControl(this.formData.timeRequired),
    publisher: new FormControl(this.formData.publisher),
    description: new FormControl(this.formData.description[0].text),
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

    localStorage.setItem('aoe.new-educational-resource', JSON.stringify(data));
  }

  resetForm() {
    this.basicDetailsForm.reset();
  }
}
