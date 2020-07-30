import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CollectionForm } from '@models/collections/collection-form';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-collection-basic-details-tab',
  templateUrl: './collection-basic-details-tab.component.html',
  styleUrls: ['./collection-basic-details-tab.component.scss']
})
export class CollectionBasicDetailsTabComponent implements OnInit, OnDestroy {
  @Input() collection: CollectionForm;
  @Input() collectionId: string;
  @Input() tabId: number;
  @Output() abort = new EventEmitter();
  form: FormGroup;
  lang = this.translate.currentLang;
  submitted = false;

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
      name: this.fb.control(null),
      description: this.fb.control(null),
      keywords: this.fb.control(null),
      educationalRoles: this.fb.control(null),
      educationalUses: this.fb.control(null),
      languages: this.fb.control(null),
      accessibilityFeatures: this.fb.control(null),
      accessibilityHazards: this.fb.control(null),
    });

    if (sessionStorage.getItem(environment.collection) === null) {
      this.form.patchValue(this.collection);
    } else {
      this.form.patchValue(JSON.parse(sessionStorage.getItem(environment.collection)));
    }

    console.log(this.submitted);
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
      this.titleSvc.setTitle(`${translations.main}: ${translations.basic} ${environment.title}`);
    });
  }

  /**
   * Runs on submit. Redirects user to the next tab if form is valid.
   */
  onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      if (this.form.dirty) {
        this.saveCollection();
      }

      this.router.navigate(['/kokoelma', this.collectionId, 'muokkaa', this.tabId + 1]);
    }
  }

  /**
   * Saves collection to session storage.
   */
  saveCollection(): void {
    const changedCollection: CollectionForm = sessionStorage.getItem(environment.collection) !== null
      ? JSON.parse(sessionStorage.getItem(environment.collection))
      : this.collection;

    changedCollection.name = this.form.get('name').value;
    changedCollection.description = this.form.get('description').value;
    changedCollection.keywords = this.form.get('keywords').value;
    changedCollection.educationalRoles = this.form.get('educationalRoles').value;
    changedCollection.educationalUses = this.form.get('educationalUses').value;
    changedCollection.languages = this.form.get('languages').value;
    changedCollection.accessibilityFeatures = this.form.get('accessibilityFeatures').value;
    changedCollection.accessibilityHazards = this.form.get('accessibilityHazards').value;

    sessionStorage.setItem(environment.collection, JSON.stringify(changedCollection));
  }

  /**
   * Emits EventEmitter indicating user wants to abort.
   */
  emitAbort(): void {
    this.abort.emit();
  }
}
