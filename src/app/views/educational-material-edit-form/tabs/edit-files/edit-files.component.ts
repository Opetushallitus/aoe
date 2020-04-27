import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BackendService } from '@services/backend.service';
import { EducationalMaterialForm } from '@models/educational-material-form';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { environment } from '../../../../../environments/environment';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Language } from '@models/koodisto-proxy/language';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';

@Component({
  selector: 'app-tabs-edit-files',
  templateUrl: './edit-files.component.html',
  styleUrls: ['./edit-files.component.scss']
})
export class EditFilesComponent implements OnInit {
  @Input() material: EducationalMaterialForm;
  @Input() materialId: number;
  @Input() tabId: number;
  form: FormGroup;
  lang: string = this.translate.currentLang;
  otherLangs: string[];
  translationsModalRef: BsModalRef;
  submitted = false;
  languageSubscription: Subscription;
  languages: Language[];
  @Output() abortEdit = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private backendSvc: BackendService,
    private koodistoSvc: KoodistoProxyService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: this.fb.group({
        fi: this.fb.control(null),
        sv: this.fb.control(null),
        en: this.fb.control(null),
      }),
      fileDetails: this.fb.array([]),
    });

    this.updateLanguages();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.updateLanguages();
    });

    if (sessionStorage.getItem(environment.editMaterial) === null) {
      this.form.patchValue(this.material);

      this.patchFileDetails(this.material.fileDetails);
    } else {
      const editMaterial: EducationalMaterialForm = JSON.parse(sessionStorage.getItem(environment.editMaterial));

      this.form.patchValue(editMaterial);

      this.patchFileDetails(editMaterial.fileDetails);
    }

    // languages
    this.languageSubscription = this.koodistoSvc.languages$.subscribe((languages: Language[]) => {
      this.languages = languages;
    });
    this.koodistoSvc.updateLanguages();
  }

  get nameCtrl(): FormControl {
    return this.form.get(`name.${this.lang}`) as FormControl;
  }

  get names(): FormGroup {
    return this.form.get('name') as FormGroup;
  }

  get fileDetailsArray(): FormArray {
    return this.form.get('fileDetails') as FormArray;
  }

  /**
   * Filters otherLangs array to exclude current language. Sets
   * validators for names.
   */
  updateLanguages(): void {
    // set other than current language to an array
    this.otherLangs = this.translate.getLangs().filter((lang: string) => lang !== this.lang);

    // set other languages validators null for name
    this.otherLangs.forEach((lang: string) => {
      this.names.get(lang).setValidators(null);
      this.names.get(lang).updateValueAndValidity();
    });

    // set current language validator required for name
    this.names.get(this.lang).setValidators([
      Validators.required,
    ]);
    this.names.get(this.lang).updateValueAndValidity();
  }

  /**
   * Shows modal for entering translation values.
   * @param {TemplateRef<any>} template
   */
  openTranslationsModal(template: TemplateRef<any>): void {
    this.translationsModalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-dialog-centered' })
    );
  }

  /**
   * Patches fileDetails array.
   * @param fileDetails
   */
  patchFileDetails(fileDetails): void {
    fileDetails.forEach((file) => {
      this.fileDetailsArray.push(this.createFileDetail(file));
    });
  }

  /**
   * Creates fileDetail FormGroup.
   * @param file
   * @returns {FormGroup}
   */
  createFileDetail(file): FormGroup {
    const subtitles = file.subtitles.map((subtitle) => {
      return this.createSubtitle(subtitle);
    });

    return this.fb.group({
      id: this.fb.control(file.id, [ Validators.required ]),
      file: this.fb.control(file.file),
      link: this.fb.control(file.link),
      displayName: this.fb.group({
        fi: this.fb.control(file.displayName.fi),
        sv: this.fb.control(file.displayName.sv),
        en: this.fb.control(file.displayName.en),
      }),
      language: this.fb.control(file.language, [ Validators.required ]),
      priority: this.fb.control(file.priority, [ Validators.required ]),
      subtitles: this.fb.array(subtitles),
    });
  }

  /**
   * Creates subtitle FormGroup.
   * @param subtitle
   * @returns {FormGroup}
   */
  createSubtitle(subtitle): FormGroup {
    return this.fb.group({
      id: this.fb.control(subtitle.id, [ Validators.required ]),
      fileId: this.fb.control(subtitle.fileId, [ Validators.required ]),
      subtitle: this.fb.control(subtitle.subtitle),
      default: this.fb.control(subtitle.default),
      kind: this.fb.control(subtitle.kind),
      label: this.fb.control(subtitle.label),
      srclang: this.fb.control(subtitle.srclang),
    });
  }

  /**
   * Makes sure there are only one default true on each file.
   * @param event
   * @param {number} i
   * @param {number} j
   */
  updateDefaultSubtitle(event, i: number, j: number): void {
    const subtitles = this.fileDetailsArray.at(i).get('subtitles') as FormArray;

    subtitles.controls.forEach((subCtrl: AbstractControl, subIndex: number) => {
      if (subIndex !== j) {
        subCtrl.get('default').setValue(false);
      }
    });
  }

  /**
   * Runs on submit. If form is valid and dirty, changed material is saved on sessionStorage.
   * If form is valid, redirects user to the next tab.
   */
  onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      if (this.form.dirty) {
        const changedMaterial: EducationalMaterialForm = sessionStorage.getItem(environment.editMaterial) !== null
          ? JSON.parse(sessionStorage.getItem(environment.editMaterial))
          : this.material;

        changedMaterial.name = this.form.get('name').value;
        changedMaterial.fileDetails = this.fileDetailsArray.value;

        sessionStorage.setItem(environment.editMaterial, JSON.stringify(changedMaterial));
      }

      this.router.navigate(['/muokkaa-oppimateriaalia', this.materialId, this.tabId + 1]);
    }
  }

  /**
   * Emits EventEmitter indicating user wants to abort.
   */
  abort(): void {
    this.abortEdit.emit();
  }
}
