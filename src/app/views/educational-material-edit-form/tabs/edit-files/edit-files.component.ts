import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BackendService } from '@services/backend.service';
import { EducationalMaterialForm } from '@models/educational-material-form';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-tabs-edit-files',
  templateUrl: './edit-files.component.html',
  styleUrls: ['./edit-files.component.scss']
})
export class EditFilesComponent implements OnInit {
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

    if (sessionStorage.getItem(environment.editMaterial) !== null) {
      this.form.patchValue(JSON.parse(sessionStorage.getItem(environment.editMaterial)));
    } else {
      this.form.patchValue(this.material);
    }
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

    if (this.form.valid && !this.form.pristine) {
      const changedMaterial: EducationalMaterialForm = sessionStorage.getItem(environment.editMaterial) !== null
        ? JSON.parse(sessionStorage.getItem(environment.editMaterial))
        : this.material;

      changedMaterial.name = this.form.get('name').value;

      sessionStorage.setItem(environment.editMaterial, JSON.stringify(changedMaterial));
    }
  }

  /**
   * Emits EventEmitter indicating user wants to abort.
   */
  abort(): void {
    this.abortEdit.emit();
  }
}
