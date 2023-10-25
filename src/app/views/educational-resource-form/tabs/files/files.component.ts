import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { environment } from '../../../../../environments/environment';
import { textInputRe, textInputValidator, validateFilename } from '../../../../shared/shared.module';
import { KoodistoService } from '@services/koodisto.service';
import { MaterialService } from '@services/material.service';
import { AuthService } from '@services/auth.service';
import { UploadMessage } from '@models/upload-message';
import { Language } from '@models/koodisto/language';
import { UploadedFile } from '@models/uploaded-file';
import { TitlesMaterialFormTabs } from '@models/translations/titles';
import { SubtitleKind } from '@models/material/subtitle';
import { mimeTypes } from '@constants/mimetypes';
import { validatorParams } from '@constants/validator-params';

@Component({
    selector: 'app-tabs-files',
    templateUrl: './files.component.html',
})
export class FilesComponent implements OnInit, OnDestroy {
    private savedDataKey = environment.newERLSKey;
    private fileUploadLSKey = environment.fileUploadLSKey;
    lang: string = this.translate.currentLang;
    otherLangs: string[];
    savedData: any;

    form: FormGroup;
    videoFiles: number[] = [];
    submitted = false;
    modalRef: BsModalRef;
    uploadResponses: UploadMessage[] = [];

    languageSubscription: Subscription;
    languages: Language[];
    uploadedFileSubscription: Subscription;
    uploadedFiles: UploadedFile[];
    totalFileCount = 0;
    completedUploads = 0;

    materialId: number;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private modalService: BsModalService,
        private koodistoService: KoodistoService,
        private translate: TranslateService,
        private materialSvc: MaterialService,
        private titleSvc: Title,
        private authService: AuthService,
    ) {}

    ngOnInit(): void {
        this.setTitle();

        this.form = this.fb.group({
            name: this.fb.group({
                fi: this.fb.control(null, [Validators.maxLength(validatorParams.name.maxLength), textInputValidator()]),
                sv: this.fb.control(null, [Validators.maxLength(validatorParams.name.maxLength), textInputValidator()]),
                en: this.fb.control(null, [Validators.maxLength(validatorParams.name.maxLength), textInputValidator()]),
            }),
            files: this.fb.array([this.createFile(), this.createFile()]),
        });

        this.updateLanguages();

        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            this.lang = event.lang;

            this.koodistoService.updateLanguages();

            this.setTitle();
            this.updateLanguages();
        });

        this.languageSubscription = this.koodistoService.languages$.subscribe((languages: Language[]) => {
            this.languages = languages;
        });
        this.koodistoService.updateLanguages();

        this.savedData = JSON.parse(sessionStorage.getItem(this.savedDataKey));

        if (this.savedData) {
            if (this.savedData.name) {
                this.form.get('name').patchValue(this.savedData.name);
            }
        }

        if (sessionStorage.getItem(this.fileUploadLSKey) !== null) {
            const fileUpload = JSON.parse(sessionStorage.getItem(this.fileUploadLSKey));

            this.materialId = fileUpload.id;

            this.uploadedFileSubscription = this.materialSvc.uploadedFiles$.subscribe(
                (uploadedFiles: UploadedFile[]) => {
                    this.uploadedFiles = uploadedFiles;
                },
            );

            this.materialSvc.updateUploadedFiles(this.materialId);
        }
    }

    ngOnDestroy(): void {
        // save data if its valid, dirty and not submitted
        if (this.submitted === false && this.form.dirty && this.form.valid) {
            this.saveData();
        }

        this.languageSubscription.unsubscribe();
    }

    setTitle(): void {
        this.translate.get('titles.addMaterial').subscribe((translations: TitlesMaterialFormTabs) => {
            this.titleSvc.setTitle(`${translations.main}: ${translations.files} ${environment.title}`);
        });
    }

    updateLanguages(): void {
        // set other than current language to an array
        this.otherLangs = this.translate.getLangs().filter((lang: string) => lang !== this.lang);
    }

    get name(): FormControl {
        return this.form.get(`name.${this.lang}`) as FormControl;
    }

    get names(): FormGroup {
        return this.form.get('name') as FormGroup;
    }

    get files(): FormArray {
        return this.form.get('files') as FormArray;
    }

    createFile(): FormGroup {
        return this.fb.group({
            file: [''],
            link: this.fb.control(null, [
                Validators.pattern(validatorParams.file.link.pattern),
                Validators.maxLength(validatorParams.file.link.maxLength),
            ]),
            language: this.fb.control(this.lang),
            displayName: this.fb.group({
                fi: this.fb.control(null, [
                    Validators.maxLength(validatorParams.file.displayName.maxLength),
                    textInputValidator(),
                ]),
                sv: this.fb.control(null, [
                    Validators.maxLength(validatorParams.file.displayName.maxLength),
                    textInputValidator(),
                ]),
                en: this.fb.control(null, [
                    Validators.maxLength(validatorParams.file.displayName.maxLength),
                    textInputValidator(),
                ]),
            }),
            subtitles: this.fb.array([]),
        });
    }

    addFile(): void {
        this.files.push(this.createFile());
    }

    createSubtitle(): FormGroup {
        return this.fb.group({
            file: [''],
            default: this.fb.control(false),
            kind: this.fb.control(SubtitleKind.subtitles),
            label: this.fb.control(null, [
                Validators.maxLength(validatorParams.file.subtitle.label.maxLength),
                textInputValidator(),
            ]),
            srclang: this.fb.control(null),
        });
    }

    addSubtitle(i: number): void {
        const subtitles = this.files.at(i).get('subtitles') as FormArray;
        subtitles.push(this.createSubtitle());
    }

    removeSubtitle(i: number, j: number): void {
        const subtitles = this.files.at(i).get('subtitles') as FormArray;
        subtitles.removeAt(j);
    }

    openModal(template: TemplateRef<any>): void {
        this.modalRef = this.modalService.show(template, Object.assign({}, { class: 'modal-dialog-centered' }));
    }

    onFileChange(event: Event, i: number): void {
        if ((event.target as HTMLInputElement).files.length > 0) {
            const file = (event.target as HTMLInputElement).files[0];

            if (mimeTypes.video.includes(file.type)) {
                this.addSubtitle(i);
                this.videoFiles.push(i);
            } else {
                const subtitles = this.files.at(i).get('subtitles') as FormArray;
                subtitles.clear();
                this.videoFiles = this.videoFiles.filter((v) => v !== i);
            }

            this.files.at(i).get('file').setValue(file);

            // remove extension from filename
            const fileName = file.name.replace(/\.[^/.]+$/, '').replace(textInputRe, '');

            this.files.at(i).get(`displayName.${this.lang}`).setValue(fileName);
        }
    }

    onSubtitleChange(event: Event, i: number, j: number): void {
        if ((event.target as HTMLInputElement).files.length > 0) {
            const subtitle = (event.target as HTMLInputElement).files[0];
            const subtitles = <FormArray>this.files.at(i).get('subtitles');

            subtitles.at(j).get('file').setValue(subtitle);

            // add validators
            subtitles.at(j).get('kind').setValidators([Validators.required]);
            subtitles.at(j).get('kind').updateValueAndValidity();

            subtitles
                .at(j)
                .get('label')
                .setValidators([
                    Validators.required,
                    Validators.maxLength(validatorParams.file.subtitle.label.maxLength),
                    textInputValidator(),
                ]);
            subtitles.at(j).get('label').updateValueAndValidity();

            subtitles.at(j).get('srclang').setValidators([Validators.required]);
            subtitles.at(j).get('srclang').updateValueAndValidity();
        }
    }

    updateDefaultSubtitle(_event: Event, i: number, j: number): void {
        const subtitles = this.files.at(i).get('subtitles') as FormArray;

        subtitles.controls.forEach((subCtrl, x) => {
            if (x !== j) {
                subCtrl.get('default').setValue(false);
            }
        });
    }

    validateFiles(): void {
        this.files.controls = this.files.controls.filter(
            (ctrl) =>
                ctrl.get('file').value !== '' || (ctrl.get('link').value !== null && ctrl.get('link').value !== ''),
        );

        this.files.controls.forEach((ctrl) => {
            this.totalFileCount++;

            const language = ctrl.get('language');
            const displayName = ctrl.get(`displayName.${this.lang}`);

            language.setValidators([Validators.required]);
            language.updateValueAndValidity();

            displayName.setValidators([
                Validators.required,
                Validators.maxLength(validatorParams.file.displayName.maxLength),
                textInputValidator(),
            ]);
            displayName.updateValueAndValidity();
        });
    }

    validateSubtitles(): void {
        this.files.controls.forEach((fileCtrl) => {
            const subtitles = fileCtrl.get('subtitles') as FormArray;

            if (subtitles.value.length > 0) {
                subtitles.controls.forEach((subCtrl) => {
                    if (!subCtrl.get('file').value) {
                        subtitles.removeAt(subtitles.controls.findIndex((sub) => sub === subCtrl));
                    }
                });

                this.totalFileCount = this.totalFileCount + subtitles.controls.length;
            }
        });
    }

    uploadFiles(): void {
        const nth = this.uploadedFiles ? this.uploadedFiles.length - 1 : 0;

        this.files.value.forEach((file, i) => {
            if (file.link) {
                this.materialSvc
                    .postLinks({
                        link: file.link,
                        displayName: file.displayName,
                        language: file.language,
                        priority: nth + i,
                    })
                    .subscribe(
                        () => {},
                        (err) => console.error(err),
                        () => this.completeUpload(),
                    );
            } else {
                const formData = new FormData();
                formData.append('file', file.file, validateFilename(file.file.name));
                formData.append(
                    'fileDetails',
                    JSON.stringify({
                        displayName: file.displayName,
                        language: file.language,
                        priority: nth + i,
                    }),
                );

                this.materialSvc.uploadFiles(formData).subscribe(
                    (res) => {
                        this.uploadResponses[i] = res;

                        if (res.response) {
                            if (file.subtitles.length > 0) {
                                file.subtitles.forEach((subtitle) => {
                                    const subFormData = new FormData();
                                    subFormData.append(
                                        'attachment',
                                        subtitle.file,
                                        validateFilename(subtitle.file.name),
                                    );
                                    subFormData.append(
                                        'attachmentDetails',
                                        JSON.stringify({
                                            default: subtitle.default,
                                            kind: subtitle.kind,
                                            label: subtitle.label,
                                            srclang: subtitle.srclang,
                                        }),
                                    );

                                    this.materialSvc.uploadSubtitle(res.response.material[0].id, subFormData).subscribe(
                                        (subRes) => console.log(subRes),
                                        (subErr) => console.error(subErr),
                                        () => this.completeUpload(),
                                    );
                                });
                            }
                        }
                    },
                    (err) => console.error(err),
                    () => this.completeUpload(),
                );
            }
        });
    }

    calculateTotalFileCount(): void {
        this.totalFileCount += this.files.value.length;

        this.files.value.forEach((file) => {
            this.totalFileCount += file.subtitles.length;
        });
    }

    completeUpload(): void {
        this.completedUploads++;

        if (this.totalFileCount === 0) {
            this.calculateTotalFileCount();
        }

        if (this.completedUploads === this.totalFileCount) {
            this.router.navigate(['/lisaa-oppimateriaali', 2]).then();
        }
    }

    deleteFile(fileId: number): void {
        this.materialSvc.deleteFile(fileId).subscribe(
            () => this.materialSvc.updateUploadedFiles(this.materialId),
            (err) => console.error(err),
        );
    }

    deleteAttachment(attachmentId: number): void {
        this.materialSvc.deleteAttachment(attachmentId).subscribe(
            () => this.materialSvc.updateUploadedFiles(this.materialId),
            (err) => console.error(err),
        );
    }

    onSubmit(): void {
        this.submitted = true;

        if (this.authService.hasUserData()) {
            this.validateFiles();
            this.validateSubtitles();

            if (this.form.valid) {
                if (this.form.dirty) {
                    this.saveData();
                }

                if (this.totalFileCount > 0) {
                    if (!this.materialId) {
                        const formData = new FormData();
                        formData.append('name', JSON.stringify(this.names.value));

                        this.materialSvc.uploadFiles(formData).subscribe(
                            () => {},
                            (err) => console.error(err),
                            () => this.uploadFiles(),
                        );
                    } else {
                        this.uploadFiles();
                    }
                } else {
                    this.router.navigate(['/lisaa-oppimateriaali', 2]).then();
                }
            }
            this.totalFileCount = 0;
        } else {
            this.form.markAsPristine();
            this.router.navigateByUrl('/etusivu').then();
        }
    }

    saveData(): void {
        const data = Object.assign({}, JSON.parse(sessionStorage.getItem(this.savedDataKey)), {
            name: this.names.value,
        });

        // save data to session storage
        sessionStorage.setItem(this.savedDataKey, JSON.stringify(data));
    }

    resetForm(): void {
        // reset submit status
        this.submitted = false;

        // reset form values
        this.form.reset();

        // clear data from session storage
        sessionStorage.removeItem(this.savedDataKey);
        sessionStorage.removeItem(this.fileUploadLSKey);

        this.router.navigateByUrl('/').then();
    }
}
