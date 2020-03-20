import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EducationalMaterialForm } from '@models/educational-material-form';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { BackendService } from '@services/backend.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-tabs-edit-basic-details',
  templateUrl: './edit-basic-details.component.html',
  styleUrls: ['./edit-basic-details.component.scss']
})
export class EditBasicDetailsComponent implements OnInit, OnDestroy {
  @Input() material: EducationalMaterialForm;
  form: FormGroup;
  lang: string = this.translate.currentLang;
  otherLangs: string[];
  translationsModalRef: BsModalRef;
  submitted = false;
  @Output() abortEdit = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private backendSvc: BackendService,
    private translate: TranslateService,
    private modalService: BsModalService,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      keywords: this.fb.control(null, [ Validators.required ]),
      authors: this.fb.array([]),
      learningResourceTypes: this.fb.control(null, [ Validators.required ]),
      educationalRoles: this.fb.control(null),
      educationalUses: this.fb.control(null),
      description: this.fb.group({
        fi: this.fb.control(null),
        sv: this.fb.control(null),
        en: this.fb.control(null),
      }),
    });

    this.updateLanguages();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.updateLanguages();
    });

    if (sessionStorage.getItem(environment.editMaterial) !== null) {
      this.form.patchValue(JSON.parse(sessionStorage.getItem(environment.editMaterial)));
    } else {
      this.form.patchValue(this.material);
    }

    // @todo: add authors
  }

  ngOnDestroy(): void { }

  /**
   * Filters otherLangs array to exclude current language.
   */
  updateLanguages(): void {
    // set other than current language to an array
    this.otherLangs = this.translate.getLangs().filter((lang: string) => lang !== this.lang);
  }

  get authorsArray(): FormArray {
    return this.form.get('authors') as FormArray;
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
   * Creates author FormGroup.
   * @param author
   * @returns {FormGroup}
   */
  createAuthor(author?): FormGroup {
    return this.fb.group({
      author: this.fb.control(author ? author.author : null, [ Validators.required ]),
      organization: this.fb.control(author ? author.organization : null),
    });
  }

  /**
   * Creates organization FormGroup.
   * @param organization
   * @returns {FormGroup}
   */
  createOrganization(organization?): FormGroup {
    return this.fb.group({
      organization: this.fb.control(organization ? organization.organization : null, [ Validators.required ]),
    });
  }

  addAuthor(): void {
    this.authorsArray.push(this.createAuthor());
  }

  addOrganization(): void {
    this.authorsArray.push(this.createOrganization());
  }

  removeAuthor(i: number): void {
    this.authorsArray.removeAt(i);
  }

  /**
   * Emits EventEmitter indicating user wants to abort.
   */
  abort(): void {
    this.abortEdit.emit();
  }
}
