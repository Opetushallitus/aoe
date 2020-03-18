import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
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
  modalRef: BsModalRef;
  submitted = false;

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

  updateLanguages(): void {
    // set other than current language to an array
    this.otherLangs = this.translate.getLangs().filter((lang: string) => lang !== this.lang);
  }

  openModal(template: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-dialog-centered' })
    );
  }

  deleteFile(fileId: number): void {
    this.backendSvc.deleteFile(fileId).subscribe(
      (res) => console.log(res),
      (err) => console.error(err),
    );
  }

  onSubmit(): void {
    this.submitted = true;
  }
}
