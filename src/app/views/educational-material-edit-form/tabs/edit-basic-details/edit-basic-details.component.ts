import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EducationalMaterialForm } from '@models/educational-material-form';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { BackendService } from '@services/backend.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { Subscription } from 'rxjs';
import { KeyValue } from '@angular/common';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { addCustomItem } from '../../../../shared/shared.module';
import { LearningResourceType } from '@models/koodisto-proxy/learning-resource-type';
import { EducationalRole } from '@models/koodisto-proxy/educational-role';
import { EducationalUse } from '@models/koodisto-proxy/educational-use';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs-edit-basic-details',
  templateUrl: './edit-basic-details.component.html',
  styleUrls: ['./edit-basic-details.component.scss']
})
export class EditBasicDetailsComponent implements OnInit, OnDestroy {
  @Input() material: EducationalMaterialForm;
  @Input() materialId: number;
  @Input() tabId: number;
  form: FormGroup;
  lang: string = this.translate.currentLang;
  otherLangs: string[];
  translationsModalRef: BsModalRef;
  submitted = false;
  addCustomItem = addCustomItem;
  organizationSubscription: Subscription;
  organizations: KeyValue<string, string>[];
  keywordSubscription: Subscription;
  keywords: KeyValue<string, string>[];
  learningResourceTypeSubscription: Subscription;
  learningResourceTypes: LearningResourceType[];
  educationalRoleSubscription: Subscription;
  educationalRoles: EducationalRole[];
  educationalUseSubscription: Subscription;
  educationalUses: EducationalUse[];
  @Output() abortEdit = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private backendSvc: BackendService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private koodistoSvc: KoodistoProxyService,
    private router: Router,
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

      this.koodistoSvc.updateOrganizations();
      this.koodistoSvc.updateKeywords();
      this.koodistoSvc.updateLearningResourceTypes();
      this.koodistoSvc.updateEducationalRoles();
      this.koodistoSvc.updateEducationalUses();

      this.updateLanguages();
    });

    if (sessionStorage.getItem(environment.editMaterial) !== null) {
      const editMaterial: EducationalMaterialForm = JSON.parse(sessionStorage.getItem(environment.editMaterial));

      this.form.patchValue(editMaterial);

      this.patchAuthors(editMaterial.authors);
    } else {
      this.form.patchValue(this.material);

      this.patchAuthors(this.material.authors);
    }

    // organizations
    this.organizationSubscription = this.koodistoSvc.organizations$
      .subscribe((organizations: KeyValue<string, string>[]) => {
        this.organizations = organizations;
      });
    this.koodistoSvc.updateOrganizations();

    // keywords
    this.keywordSubscription = this.koodistoSvc.keywords$
      .subscribe((keywords: KeyValue<string, string>[]) => {
        this.keywords = keywords;
      });
    this.koodistoSvc.updateKeywords();

    // learning resource types
    this.learningResourceTypeSubscription = this.koodistoSvc.learningResourceTypes$
      .subscribe((types: LearningResourceType[]) => {
        this.learningResourceTypes = types;
      });
    this.koodistoSvc.updateLearningResourceTypes();

    // educational roles
    this.educationalRoleSubscription = this.koodistoSvc.educationalRoles$
      .subscribe((roles: EducationalRole[]) => {
        this.educationalRoles = roles;
      });
    this.koodistoSvc.updateEducationalRoles();

    // educational uses
    this.educationalUseSubscription = this.koodistoSvc.educationalUses$
      .subscribe((uses: EducationalUse[]) => {
        this.educationalUses = uses;
      });
    this.koodistoSvc.updateEducationalUses();
  }

  ngOnDestroy(): void {
    this.organizationSubscription.unsubscribe();
    this.keywordSubscription.unsubscribe();
    this.learningResourceTypeSubscription.unsubscribe();
    this.educationalRoleSubscription.unsubscribe();
    this.educationalUseSubscription.unsubscribe();
  }

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
   * Patch authors array.
   * @param authors
   */
  patchAuthors(authors): void {
    authors.forEach((author) => {
      if (author.author) {
        this.authorsArray.push(this.createAuthor(author));
      } else {
        this.authorsArray.push(this.createOrganization(author));
      }
    });
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

  /**
   * Adds author to authors array.
   */
  addAuthor(): void {
    this.authorsArray.push(this.createAuthor());
  }

  /**
   * Adds organization author to authors array.
   */
  addOrganization(): void {
    this.authorsArray.push(this.createOrganization());
  }

  /**
   * Removes author at specific index from authors array.
   * @param {number} i
   */
  removeAuthor(i: number): void {
    this.authorsArray.removeAt(i);
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

        changedMaterial.authors = this.form.get('authors').value;
        changedMaterial.keywords = this.form.get('keywords').value;
        changedMaterial.learningResourceTypes = this.form.get('learningResourceTypes').value;
        changedMaterial.educationalRoles = this.form.get('educationalRoles').value;
        changedMaterial.educationalUses = this.form.get('educationalUses').value;
        changedMaterial.description = this.form.get('description').value;

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

  /**
   * Redirects user to previous tab.
   */
  previous(): void {
    this.router.navigate(['/muokkaa-oppimateriaalia', this.materialId, this.tabId - 1]);
  }
}
