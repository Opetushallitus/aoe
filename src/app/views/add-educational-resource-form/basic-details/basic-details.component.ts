import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';

import { KoodistoProxyService } from '../../../services/koodisto-proxy.service';

@Component({
  selector: 'app-basic-details',
  templateUrl: './basic-details.component.html',
})
export class BasicDetailsComponent implements OnInit {
  private localStorageKey = 'aoe.new-educational-resource';
  public submitted = false;
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
    image: new FormControl(null),
    file: new FormControl(null),
    link: new FormControl(null),
    name: new FormControl(null, Validators.required),
    keywords: new FormControl(null, Validators.required),
    author: new FormControl(null, Validators.required),
    organisation: new FormControl(null),
    learningResourceType: new FormControl(null, Validators.required),
    timeRequired: new FormControl(null),
    publisher: new FormControl(null),
    description: new FormControl(null),
  });

  private formData = JSON.parse(localStorage.getItem(this.localStorageKey));

  constructor(
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private router: Router
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

    if (this.formData) {
      const name = this.formData.name.find(e => e.lang === 'fi');
      const description = this.formData.description.find(e => e.lang === 'fi');

      this.basicDetailsForm.get('name').setValue(name.text);
      this.basicDetailsForm.get('keywords').setValue(this.formData.keywords);
      this.basicDetailsForm.get('author').setValue(this.formData.author);
      this.basicDetailsForm.get('organisation').setValue(this.formData.organisation);
      this.basicDetailsForm.get('learningResourceType').setValue(this.formData.learningResourceType);
      this.basicDetailsForm.get('timeRequired').setValue(this.formData.timeRequired);
      this.basicDetailsForm.get('publisher').setValue(this.formData.publisher);
      this.basicDetailsForm.get('description').setValue(description.text);
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
        id: 1337,
        materials: [
          {
            id: 1234,
            name: 'Tiedosto.pdf',
            link: this.basicDetailsForm.get('link').value,
            file: {
              filePath: '',
              originalFilename: '',
              fileSize: 1219213,
              mimeType: '',
              format: '',
              thumbnail: '',
            }
          },
        ],
        owner: {
          id: 12003,
          firstName: 'Matti',
          lastName: 'Meikäläinen'
        },
        name: [
          { lang: 'fi', text: this.basicDetailsForm.get('name').value },
        ],
        slug: [
          { lang: 'fi', text: this.basicDetailsForm.get('name').value },
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
          { lang: 'en', text: 'luukukouk' },
          { lang: 'sv', text: 'adasdsa' },
        ],
        keywords: this.basicDetailsForm.get('keywords').value,
        learningResourceType: this.basicDetailsForm.get('learningResourceType').value,
        timeRequired: this.basicDetailsForm.get('timeRequired').value,
      };

      // save data to local storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));

      // redirect to next step
      this.router.navigateByUrl('/lisaa-oppimateriaali/koulutustiedot');
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
}
