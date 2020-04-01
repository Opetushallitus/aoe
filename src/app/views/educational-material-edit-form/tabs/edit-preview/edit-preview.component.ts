import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EducationalMaterialForm } from '@models/educational-material-form';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-tabs-edit-preview',
  templateUrl: './edit-preview.component.html',
  styleUrls: ['./edit-preview.component.scss']
})
export class EditPreviewComponent implements OnInit {
  @Input() material: EducationalMaterialForm;
  @Input() materialId: number;
  @Input() tabId: number;
  form: FormGroup;
  lang: string;
  submitted = false;
  previewMaterial: EducationalMaterialForm;
  @Output() abortEdit = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      confirm: this.fb.control(false, [ Validators.requiredTrue ]),
    });

    this.lang = this.translate.currentLang;

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    if (sessionStorage.getItem(environment.editMaterial) === null) {
      this.previewMaterial = this.material;
    } else {
      this.previewMaterial = JSON.parse(sessionStorage.getItem(environment.editMaterial));
    }
  }

  /**
   * Moves item in array.
   * @param {CdkDragDrop<any>} event
   */
  drop(event: CdkDragDrop<any>) {
    moveItemInArray(this.previewMaterial.fileDetails, event.previousIndex, event.currentIndex);
  }

  /**
   * Runs on submit. If form is valid and dirty, changed material is saved on sessionStorage.
   * If form is valid, redirects user to the next tab.
   */
  onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      /*const changedMaterial = this.previewMaterial;

      // @ts-ignore
      changedMaterial.fileDetails = this.previewMaterial.fileDetails.map((file, idx) => ({
        ...file,
        priority: idx,
      }));

      console.log(changedMaterial);*/
      // handle alignment objects?
      // post updated material
    }

    // this.router.navigate(['/materiaali', this.materialId]);
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
