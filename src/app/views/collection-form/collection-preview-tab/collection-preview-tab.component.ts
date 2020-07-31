import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CollectionForm } from '@models/collections/collection-form';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-collection-preview-tab',
  templateUrl: './collection-preview-tab.component.html',
  styleUrls: ['./collection-preview-tab.component.scss']
})
export class CollectionPreviewTabComponent implements OnInit, OnDestroy {
  @Input() collection: CollectionForm;
  @Input() collectionId: string;
  @Input() tabId: number;
  @Output() abort = new EventEmitter();
  form: FormGroup;
  lang = this.translate.currentLang;
  submitted = false;
  previewCollection: CollectionForm;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private router: Router,
    private titleSvc: Title,
  ) { }

  ngOnInit(): void {
    this.setTitle();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.setTitle();
    });

    this.form = this.fb.group({
      hasName: this.fb.control(false, [
        Validators.requiredTrue,
      ]),
      hasKeywords: this.fb.control(false, [
        Validators.requiredTrue,
      ]),
      hasDescription: this.fb.control(false, [
        Validators.requiredTrue,
      ]),
    });

    if (sessionStorage.getItem(environment.collection) === null) {
      this.previewCollection = this.collection;
    } else {
      this.previewCollection = JSON.parse(sessionStorage.getItem(environment.collection));
    }

    if (this.previewCollection.name) {
      this.form.get('hasName').setValue(true);
    }

    if (this.previewCollection.keywords && this.previewCollection.keywords.length > 0) {
      this.form.get('hasKeywords').setValue(true);
    }

    if (this.previewCollection.description) {
      this.form.get('hasDescription').setValue(true);
    }
  }

  ngOnDestroy(): void {
    if (this.submitted === false && this.form.dirty && this.form.valid) {
      this.saveCollection();
    }
  }

  /**
   * Updates page title.
   */
  setTitle(): void {
    this.translate.get('titles.collection').subscribe((translations: any) => {
      this.titleSvc.setTitle(`${translations.main}: ${translations.preview} ${environment.title}`);
    });
  }

  /**
   * Runs on submit. Redirects user to the next tab if form is valid.
   */
  onSubmit(publishCollection?: boolean): void {
    this.submitted = true;
    const publish = publishCollection ? publishCollection : true;

    if (this.form.valid) {
      // @todo: PUT request to backend

      // updatedCollection.publish = publish;

      this.router.navigate(['/kokoelma', this.collectionId]);
    }
  }

  /**
   * Saves collection to session storage.
   */
  saveCollection(): void {
    const changedCollection: CollectionForm = sessionStorage.getItem(environment.collection) !== null
      ? JSON.parse(sessionStorage.getItem(environment.collection))
      : this.collection;

    // @todo: add changed values

    sessionStorage.setItem(environment.collection, JSON.stringify(changedCollection));
  }

  /**
   * Emits EventEmitter indicating user wants to abort.
   */
  emitAbort(): void {
    this.abort.emit();
  }

  /**
   * Redirects user to previous tab.
   */
  previous(): void {
    this.router.navigate(['/kokoelma', this.collectionId, 'muokkaa', this.tabId - 1]);
  }
}
