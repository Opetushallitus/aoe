import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BackendService } from '@services/backend.service';
import { EducationalMaterialForm } from '@models/educational-material-form';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from '../../../../../environments/environment';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Language } from '@models/koodisto-proxy/language';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { UploadMessage } from '@models/upload-message';
import { LinkPost } from '@models/link-post';
import { LinkPostResponse } from '@models/link-post-response';
import { mimeTypes } from '../../../../constants/mimetypes';
import { AttachmentPostResponse } from '@models/attachment-post-response';
import { Title } from '@angular/platform-browser';
import { validateFilename } from '../../../../shared/shared.module';

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
  showReplaceInput: boolean[] = [];
  showReplaceSubtitleInput: any[] = [];
  videoFiles: number[] = [];
  completedUploads = 0;
  completedSubtitleUploads = 0;
  uploadResponses: UploadMessage[] = [];
  newMaterialCount = 0;
  newSubtitleCount = 0;
  isVersioned: boolean;
  @Output() abortEdit = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private backendSvc: BackendService,
    private koodistoSvc: KoodistoProxyService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private router: Router,
    private titleSvc: Title,
  ) { }

  ngOnInit(): void {
    this.setTitle();

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

      this.setTitle();
      this.updateLanguages();
    });

    if (sessionStorage.getItem(environment.editMaterial) === null) {
      this.isVersioned = false;

      this.form.patchValue(this.material);

      this.patchFileDetails(this.material.fileDetails);
    } else {
      const editMaterial: EducationalMaterialForm = JSON.parse(sessionStorage.getItem(environment.editMaterial));

      this.isVersioned = editMaterial.isVersioned;

      this.form.patchValue(editMaterial);

      this.patchFileDetails(editMaterial.fileDetails);
    }

    // languages
    this.languageSubscription = this.koodistoSvc.languages$.subscribe((languages: Language[]) => {
      this.languages = languages;
    });
    this.koodistoSvc.updateLanguages();
  }

  setTitle(): void {
    this.translate.get('titles.editMaterial').subscribe((translations: any) => {
      this.titleSvc.setTitle(`${translations.main}: ${translations.files} ${environment.title}`);
    });
  }

  get nameCtrl(): FormControl {
    return this.form.get(`name.${this.lang}`) as FormControl;
  }

  get names(): FormGroup {
    return this.form.get('name') as FormGroup;
  }

  get materialDetailsArray(): FormArray {
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
    fileDetails.forEach((file, i: number) => {
      this.materialDetailsArray.push(this.createFileDetail(file));

      if (mimeTypes.video.includes(file.mimeType)) {
        this.videoFiles.push(i);
      }
    });
  }

  /**
   * Creates fileDetail FormGroup.
   * @param file
   * @returns {FormGroup}
   */
  createFileDetail(file): FormGroup {
    const replaceSubtitleArray: boolean[] = [];
    const subtitles = file.subtitles.map((subtitle) => {
      replaceSubtitleArray.push(false);
      return this.createSubtitle(subtitle);
    });

    this.showReplaceInput.push(false);
    this.showReplaceSubtitleInput.push(replaceSubtitleArray);

    return this.fb.group({
      id: this.fb.control(file.id),
      file: this.fb.control(file.file),
      newFile: [''],
      link: this.fb.control(file.link),
      newLink: this.fb.control(null, [
        Validators.pattern('https?://.*'),
      ]),
      displayName: this.fb.group({
        fi: this.fb.control(file.displayName.fi),
        sv: this.fb.control(file.displayName.sv),
        en: this.fb.control(file.displayName.en),
      }),
      language: this.fb.control(file.language, [
        Validators.required,
      ]),
      priority: this.fb.control(file.priority),
      subtitles: this.fb.array(subtitles),
    });
  }

  /**
   * Creates new material FormGroup.
   * @returns {FormGroup}
   */
  createNewMaterial(): FormGroup {
    return this.fb.group({
      id: this.fb.control(null),
      file: this.fb.control(null),
      newFile: [''],
      link: this.fb.control(null),
      newLink: this.fb.control(null, [
        Validators.pattern('https?://.*'),
      ]),
      displayName: this.fb.group({
        fi: this.fb.control(null),
        sv: this.fb.control(null),
        en: this.fb.control(null),
      }),
      language: this.fb.control(null),
      priority: this.fb.control(null),
      subtitles: this.fb.array([]),
    });
  }

  /**
   * Creates subtitle FormGroup.
   * @param subtitle
   * @returns {FormGroup}
   */
  createSubtitle(subtitle): FormGroup {
    return this.fb.group({
      id: this.fb.control(subtitle.id),
      fileId: this.fb.control(subtitle.fileId),
      subtitle: this.fb.control(subtitle.subtitle),
      newSubtitle: [''],
      default: this.fb.control(subtitle.default),
      kind: this.fb.control(subtitle.kind),
      label: this.fb.control(subtitle.label),
      srclang: this.fb.control(subtitle.srclang),
    });
  }

  /**
   * Creates new subtitle FormGroup.
   * @returns {FormGroup}
   */
  createNewSubtitle(): FormGroup {
    return this.fb.group({
      id: this.fb.control(null),
      fileId: this.fb.control(null),
      subtitle: this.fb.control(null),
      newSubtitle: [''],
      default: this.fb.control(false),
      kind: this.fb.control('subtitles'),
      label: this.fb.control(null),
      srclang: this.fb.control(null),
    });
  }

  /**
   * Adds material to material details array.
   */
  addMaterial(): void {
    this.materialDetailsArray.push(this.createNewMaterial());
  }

  /**
   * Adds subtitle to subtitles array.
   * @param i {number} Material index
   */
  addSubtitle(i: number): void {
    const subtitlesArray = this.materialDetailsArray.at(i).get('subtitles') as FormArray;
    subtitlesArray.push(this.createNewSubtitle());
  }

  /**
   * Removes material from composition.
   * @param i {number} Material index
   */
  removeMaterial(i: number): void {
    this.materialDetailsArray.removeAt(i);

    this.isVersioned = true;

    this.form.markAsDirty();
  }

  /**
   * Removes subtitle from composition.
   * @param i {number} Material index
   * @param j {number} Subtitle index
   */
  removeSubtitle(i: number, j: number): void {
    const subtitlesArray = this.materialDetailsArray.at(i).get('subtitles') as FormArray;
    subtitlesArray.removeAt(j);

    this.isVersioned = true;

    this.form.markAsDirty();
  }

  /**
   * Makes sure there are only one default true on each file.
   * @param event
   * @param {number} i
   * @param {number} j
   */
  updateDefaultSubtitle(event, i: number, j: number): void {
    const subtitles = this.materialDetailsArray.at(i).get('subtitles') as FormArray;

    subtitles.controls.forEach((subCtrl: AbstractControl, subIndex: number) => {
      if (subIndex !== j) {
        subCtrl.get('default').setValue(false);
      }
    });
  }

  onFileChange(event, i: number): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      if (mimeTypes.video.includes(file.type)) {
        this.addSubtitle(i);
        this.videoFiles.push(i);
      } else {
        const subtitlesArray = this.materialDetailsArray.at(i).get('subtitles') as FormArray;
        subtitlesArray.clear();
        this.videoFiles = this.videoFiles.filter((video: number) => video !== i);
      }

      this.materialDetailsArray.at(i).get('newFile').setValue(file);

      this.materialDetailsArray.at(i).get('displayName').setValue({
        fi: file.name.replace(/\.[^/.]+$/, ''),
        sv: file.name.replace(/\.[^/.]+$/, ''),
        en: file.name.replace(/\.[^/.]+$/, ''),
      });

      this.form.markAsDirty();
    }
  }

  onSubtitleChange(event, i: number, j: number): void {
    if (event.target.files.length > 0) {
      const subtitleFile = event.target.files[0];
      const subtitlesArray = this.materialDetailsArray.at(i).get('subtitles') as FormArray;

      subtitlesArray.at(j).get('newSubtitle').setValue(subtitleFile);

      subtitlesArray.at(j).get('kind').setValidators([
        Validators.required,
      ]);
      subtitlesArray.at(j).get('kind').updateValueAndValidity();

      subtitlesArray.at(j).get('label').setValidators([
        Validators.required,
      ]);
      subtitlesArray.at(j).get('label').updateValueAndValidity();

      subtitlesArray.at(j).get('srclang').setValidators([
        Validators.required,
      ]);
      subtitlesArray.at(j).get('srclang').updateValueAndValidity();

      this.form.markAsDirty();
    }
  }

  validateFiles(): void {
    this.materialDetailsArray.controls = this.materialDetailsArray.controls
      .filter((material) => {
        const fileCtrl = material.get('file');
        const newFileCtrl = material.get('newFile');
        const linkCtrl = material.get('link');
        const newLinkCtrl = material.get('newLink');

        return (fileCtrl.value !== '' || newFileCtrl.value !== '')
          || ((linkCtrl.value !== null || linkCtrl.value !== '') || (newLinkCtrl.value !== null || newLinkCtrl.value !== ''));
      });

    this.materialDetailsArray.controls.forEach((material, i: number) => {
      const languageCtrl = material.get('language');
      const displayNameCtrl = material.get(`displayName.${this.lang}`);
      const priorityCtrl = material.get('priority');

      languageCtrl.setValidators([
        Validators.required,
      ]);
      languageCtrl.updateValueAndValidity();

      displayNameCtrl.setValidators([
        Validators.required,
      ]);
      displayNameCtrl.updateValueAndValidity();

      priorityCtrl.setValue(i);
    });

    if (this.materialDetailsArray.controls.length === 0) {
      this.materialDetailsArray.setErrors({ 'required': true });
    }
  }

  validateSubtitles(): void {
    this.materialDetailsArray.controls.forEach((material) => {
      const subtitlesArray = material.get('subtitles') as FormArray;

      if (subtitlesArray.value.length > 0) {
        subtitlesArray.controls.forEach((subtitle) => {
          if (!subtitle.get('subtitle').value && !subtitle.get('newSubtitle').value) {
            subtitlesArray.removeAt(subtitlesArray.controls.findIndex((subCtrl) => subCtrl === subtitle));
          }
        });
      }
    });
  }

  uploadMaterials(): void {
    this.materialDetailsArray.value.forEach((material, i: number) => {
      if (material.newFile) {
        const payload = new FormData();
        payload.append('file', material.newFile, validateFilename(material.newFile.name));
        payload.append('fileDetails', JSON.stringify({
          displayName: material.displayName,
          language: material.language,
          priority: material.priority,
        }));

        let completedResponse: UploadMessage;

        this.backendSvc.uploadFile(payload, this.materialId).subscribe(
          (response: UploadMessage) => {
            this.uploadResponses[i] = response;

            if (response.status === 'completed') {
              completedResponse = response;
            }
          },
          (error) => console.error(error),
          () => this.completeFileUpload(completedResponse, i),
        );
      }

      if (material.newLink) {
        const payload: LinkPost = {
          link: material.newLink,
          displayName: material.displayName,
          language: material.language,
          priority: material.priority,
        };

        let postResponse: LinkPostResponse;

        this.backendSvc.postLink(payload, this.materialId).subscribe(
          (response: LinkPostResponse) => postResponse = response,
          (error) => console.error(error),
          () => this.completeLinkPost(postResponse, i),
        );
      }
    });
  }

  uploadSubtitles(): void {
    this.materialDetailsArray.value.forEach((material, i: number) => {
      if (material.subtitles.length > 0) {
        material.subtitles.forEach((subtitle, j: number) => {
          if (subtitle.newSubtitle) {
            const payload = new FormData();
            payload.append('attachment', subtitle.newSubtitle, validateFilename(subtitle.newSubtitle.name));
            payload.append('attachmentDetails', JSON.stringify({
              default: subtitle.default,
              kind: subtitle.kind,
              label: subtitle.label,
              srclang: subtitle.srclang,
            }));

            let completedSubtitleResponse: AttachmentPostResponse;

            this.backendSvc.uploadSubtitle(material.id, payload).subscribe(
              (subtitleResponse: AttachmentPostResponse) => completedSubtitleResponse = subtitleResponse,
              (err) => console.error(err),
              () => this.completeSubtitleUpload(completedSubtitleResponse, i, j, material.id),
            );
          }
        });
      }
    });
  }

  /**
   * Increases completedUploads by one. If completedUploads is equal to newMaterialCount
   * saves material and redirects user to the next tab.
   * @param response {UploadMessage}
   * @param i {number} Material index
   */
  completeFileUpload(response: UploadMessage, i: number): void {
    this.completedUploads = this.completedUploads + 1;

    // update material ID
    this.materialDetailsArray.at(i).get('id').setValue(+response.response.material[0].id);

    // update material filename
    this.materialDetailsArray.at(i).get('file').setValue(response.response.material[0].createFrom);
    this.materialDetailsArray.at(i).get('newFile').setValue('');

    if (this.completedUploads === this.newMaterialCount) {
      if (this.newSubtitleCount > 0) {
        this.uploadSubtitles();
      } else {
        this.saveMaterial();
        this.redirectToNextTab();
      }
    }
  }

  /**
   * Increases completedUploads by one. If completedUploads is equal to newMaterialCount
   * saves material and redirects user to the next tab.
   * @param response {LinkPostResponse}
   * @param i {number} Material index
   */
  completeLinkPost(response: LinkPostResponse, i: number): void {
    this.completedUploads = this.completedUploads + 1;

    // update material ID
    this.materialDetailsArray.at(i).get('id').setValue(+response.link.id);

    // update material link
    this.materialDetailsArray.at(i).get('link').setValue(response.link.link);
    this.materialDetailsArray.at(i).get('newLink').setValue(null);

    if (this.completedUploads === this.newMaterialCount) {
      if (this.newSubtitleCount > 0) {
        this.uploadSubtitles();
      } else {
        this.saveMaterial();
        this.redirectToNextTab();
      }
    }
  }

  /**
   * Increases completedUploads by one. If completedUploads is equal to newMaterialCount
   * saves material and redirects user to the next tab.
   * @param response {AttachmentPostResponse}
   * @param i {number} Material index
   * @param j {number} Subtitle index
   * @param materialId {number} Material ID
   */
  completeSubtitleUpload(response: AttachmentPostResponse, i: number, j: number, materialId: number): void {
    this.completedSubtitleUploads = this.completedSubtitleUploads + 1;

    const subtitles = this.materialDetailsArray.at(i).get('subtitles') as FormArray;

    // update subtitle ID
    subtitles.at(j).get('id').setValue(+response.id);

    // update material ID
    subtitles.at(j).get('fileId').setValue(materialId);

    // update subtitle filename
    subtitles.at(j).get('subtitle').setValue(subtitles.at(j).get('newSubtitle').value.name.toLowerCase());
    subtitles.at(j).get('newSubtitle').setValue('');

    if (this.completedSubtitleUploads === this.newSubtitleCount) {
      this.saveMaterial();
      this.redirectToNextTab();
    }
  }

  /**
   * Calculates the amount of new materials.
   */
  calculateNewMaterialCount(): void {
    this.newMaterialCount = this.materialDetailsArray.controls
      .filter((material) => {
        const fileCtrl = material.get('newFile');
        const linkCtrl = material.get('newLink');

        return fileCtrl.value !== '' || (linkCtrl.value !== null && linkCtrl.value !== '');
      })
      .length;
  }

  /**
   * Calculates the amount of new subtitles.
   */
  calculateNewSubtitleCount(): void {
    this.materialDetailsArray.controls.forEach((material) => {
      const subtitles = material.get('subtitles') as FormArray;

      this.newSubtitleCount += subtitles.controls
        .filter((subtitle) => subtitle.get('newSubtitle').value !== '')
        .length;
    });
  }

  /**
   * Saves edited material details on sessionStorage.
   */
  saveMaterial(): void {
    const changedMaterial: EducationalMaterialForm = sessionStorage.getItem(environment.editMaterial) !== null
      ? JSON.parse(sessionStorage.getItem(environment.editMaterial))
      : this.material;

    changedMaterial.name = this.form.get('name').value;
    changedMaterial.fileDetails = this.materialDetailsArray.value;

    if (this.newMaterialCount > 0 || this.newSubtitleCount > 0) {
      this.isVersioned = true;
    }

    changedMaterial.isVersioned = this.isVersioned;

    sessionStorage.setItem(environment.editMaterial, JSON.stringify(changedMaterial));
  }

  /**
   * Redirects user to the next tab.
   */
  redirectToNextTab(): void {
    this.router.navigate(['/muokkaa-oppimateriaalia', this.materialId, this.tabId + 1]);
  }

  /**
   * Runs on submit. If form is valid and dirty, changed material is saved on sessionStorage.
   * If form is valid, redirects user to the next tab.
   */
  onSubmit(): void {
    this.submitted = true;

    this.validateFiles();
    this.validateSubtitles();

    if (this.form.valid) {
      if (this.form.dirty) {
        this.calculateNewMaterialCount();
        this.calculateNewSubtitleCount();

        if (this.newMaterialCount > 0) {
          this.uploadMaterials();
        } else if (this.newSubtitleCount > 0) {
          this.uploadSubtitles();
        } else {
          this.saveMaterial();
          this.redirectToNextTab();
        }
      } else {
        this.redirectToNextTab();
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
