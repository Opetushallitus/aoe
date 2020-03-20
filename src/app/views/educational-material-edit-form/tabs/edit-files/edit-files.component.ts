import { Component, EventEmitter, OnDestroy, OnInit, Output, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BackendService } from '@services/backend.service';
import { Subscription } from 'rxjs';
import { EducationalMaterialForm } from '@models/educational-material-form';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'app-tabs-edit-files',
  templateUrl: './edit-files.component.html',
  styleUrls: ['./edit-files.component.scss']
})
export class EditFilesComponent implements OnInit, OnDestroy {
  form: FormGroup;
  lang: string = this.translate.currentLang;
  otherLangs: string[];
  materialSubscription: Subscription;
  material: EducationalMaterialForm;
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
      name: this.fb.group({
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

    this.materialSubscription = this.backendSvc.editMaterial$.subscribe((material: EducationalMaterialForm) => {
      this.material = material;

      this.form.patchValue(this.material);
    });
  }

  ngOnDestroy(): void {
    this.materialSubscription.unsubscribe();
  }

  get nameCtrl(): FormControl {
    return this.form.get(`name.${this.lang}`) as FormControl;
  }

  /**
   * Filters otherLangs array to exclude current language.
   */
  updateLanguages(): void {
    // set other than current language to an array
    this.otherLangs = this.translate.getLangs().filter((lang: string) => lang !== this.lang);
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
   * Deletes file by file ID.
   * @param {number} fileId
   */
  deleteFile(fileId: number): void {
    this.backendSvc.deleteFile(fileId).subscribe(
      (res) => console.log(res),
      (err) => console.error(err),
    );
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      console.log('form is valid');

      if (this.form.pristine) {
        console.log('form is pristine');
      }
    }
  }

  /**
   * Emits EventEmitter indicating user wants to abort.
   */
  abort(): void {
    this.abortEdit.emit();
  }
}
