import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CollectionForm } from '@models/collections/collection-form';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs';
import { EducationalLevel } from '@models/koodisto-proxy/educational-level';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';

@Component({
  selector: 'app-collection-educational-details-tab',
  templateUrl: './collection-educational-details-tab.component.html',
  styleUrls: ['./collection-educational-details-tab.component.scss']
})
export class CollectionEducationalDetailsTabComponent implements OnInit, OnDestroy {
  @Input() collection: CollectionForm;
  @Input() collectionId: string;
  @Input() tabId: number;
  @Output() abort = new EventEmitter();
  form: FormGroup;
  submitted = false;
  educationalLevelSubscription: Subscription;
  educationalLevels: EducationalLevel[];

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private router: Router,
    private titleSvc: Title,
    private koodistoSvc: KoodistoProxyService,
  ) { }

  ngOnInit(): void {
    this.setTitle();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setTitle();

      this.koodistoSvc.updateEducationalLevels();
    });

    this.form = this.fb.group({
      educationalLevels: this.fb.control(null),
      earlyChildhoodEducationSubjects: this.fb.control(null),
      earlyChildhoodEducationObjectives: this.fb.control(null),
      prePrimaryEducationSubjects: this.fb.control(null),
      prePrimaryEducationObjectives: this.fb.control(null),
      basicStudySubjects: this.fb.control(null),
      basicStudyObjectives: this.fb.control(null),
      basicStudyContents: this.fb.control(null),
      upperSecondarySchoolSubjects: this.fb.control(null),
      upperSecondarySchoolObjectives: this.fb.control(null),
      upperSecondarySchoolSubjectsNew: this.fb.control(null),
      upperSecondarySchoolModulesNew: this.fb.control(null),
      upperSecondarySchoolObjectivesNew: this.fb.control(null),
      upperSecondarySchoolContentsNew: this.fb.control(null),
      vocationalDegrees: this.fb.control(null),
      vocationalUnits: this.fb.control(null),
      vocationalEducationObjectives: this.fb.control(null),
      selfMotivatedEducationSubjects: this.fb.control(null),
      selfMotivatedEducationObjectives: this.fb.control(null),
      branchesOfScience: this.fb.control(null),
      scienceBranchObjectives: this.fb.control(null),
    });

    if (sessionStorage.getItem(environment.collection) === null) {
      this.form.patchValue(this.collection);
    } else {
      this.form.patchValue(JSON.parse(sessionStorage.getItem(environment.collection)));
    }

    // educational levels
    this.educationalLevelSubscription = this.koodistoSvc.educationalLevels$
      .subscribe((levels: EducationalLevel[]) => {
        this.educationalLevels = levels;
      });
    this.koodistoSvc.updateEducationalLevels();
  }

  ngOnDestroy(): void {
    if (this.submitted === false && this.form.dirty && this.form.valid) {
      this.saveCollection();
    }

    this.educationalLevelSubscription.unsubscribe();
  }

  /**
   * Updates page title.
   */
  setTitle(): void {
    this.translate.get('titles.collection').subscribe((translations: any) => {
      this.titleSvc.setTitle(`${translations.main}: ${translations.educational} ${environment.title}`);
    });
  }

  /** @getters */
  get educationalLevelsCtrl(): FormControl {
    return this.form.get('educationalLevels') as FormControl;
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

    changedCollection.educationalLevels = this.educationalLevelsCtrl.value;

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
