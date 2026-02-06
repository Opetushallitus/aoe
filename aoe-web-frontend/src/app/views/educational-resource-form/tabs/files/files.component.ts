import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef
} from '@angular/core'
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms'
import { Router } from '@angular/router'
import { Title } from '@angular/platform-browser'
import { forkJoin, Observable, Subscription } from 'rxjs'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'
import { environment } from '@environments/environment'
import { textInputRe, textInputValidator, validateFilename } from '@shared/shared.module'
import { KoodistoService } from '@services/koodisto.service'
import { MaterialService } from '@services/material.service'
import { AuthService } from '@services/auth.service'
import { UploadMessage } from '@models/upload-message'
import { Language } from '@models/koodisto/language'
import { UploadedFile } from '@models/uploaded-file'
import { SubtitleKind } from '@models/material/subtitle'
import { mimeTypes } from '@constants/mimetypes'
import { validatorParams } from '@constants/validator-params'

@Component({
  selector: 'app-tabs-files',
  templateUrl: './files.component.html',
  standalone: false
})
export class FilesComponent implements OnInit, OnDestroy {
  @Input() educationalMaterialID$: Observable<number>
  // @Input() uploadActive: boolean;
  @Input() uploadedFiles$: Observable<UploadedFile[]>

  @Output() emitterAbort: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output() emitterEducationalMaterialID: EventEmitter<number> = new EventEmitter<number>()
  @Output() emitterUploadActive: EventEmitter<boolean> = new EventEmitter<boolean>()

  // @HostListener('window:online', ['$event']) onLine(e: any): void {}

  private savedDataKey: string = environment.newERLSKey

  completedIndexes: Set<number> = new Set<number>()
  completedUploads: number = 0
  concurrentTasks: { observable: Observable<any>; metadata: any }[] = []
  educationalMaterialID: number
  form: FormGroup
  lang: string = this.translate.currentLang
  languages: Language[]
  lastIndexOfUploadedFiles: number = 0
  modalRef: BsModalRef
  otherLangs: string[]
  savedData: any
  submitted: boolean = false
  totalFileCount: number = 0
  hasUploadIssues: boolean = false
  hasEncryptedFiles: boolean = false
  videoFiles: number[] = []
  uploadActive: boolean = false
  uploadActiveText: string = ''
  uploadErrorText: string = ''
  uploadEncryptedText: string = ''

  uploadResponses$: Observable<UploadMessage[]> = this.materialService.uploadResponses$

  subscriptionEducationalMaterialID: Subscription
  subscriptionLanguage: Subscription
  subscriptionLanguageChange: Subscription
  subscriptionUploadedFiles: Subscription

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private koodistoService: KoodistoService,
    private materialService: MaterialService,
    private modalService: BsModalService,
    private router: Router,
    private titleSvc: Title,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.setLabels()
    // this.emitterUploadActive.emit(false);
    this.form = this.fb.group({
      name: this.fb.group({
        fi: this.fb.control(null, [
          Validators.maxLength(validatorParams.name.maxLength),
          textInputValidator()
        ]),
        sv: this.fb.control(null, [
          Validators.maxLength(validatorParams.name.maxLength),
          textInputValidator()
        ]),
        en: this.fb.control(null, [
          Validators.maxLength(validatorParams.name.maxLength),
          textInputValidator()
        ])
      }),
      files: this.fb.array([this.createFile(), this.createFile()])
    })
    this.updateLanguages()
    this.subscriptionLanguageChange = this.translate.onLangChange.subscribe(
      (event: LangChangeEvent): void => {
        this.lang = event.lang
        this.koodistoService.updateLanguages()
        this.setLabels()
        this.updateLanguages()
        // Object.keys(this.form.controls).forEach((field: string): void => {
        //   this.form.get(field).updateValueAndValidity({ onlySelf: false, emitEvent: true });
        //   console.log('Field:', field, ' => ', this.form.get(field).valid);
        // });
      }
    )
    this.subscriptionEducationalMaterialID = this.educationalMaterialID$.subscribe(
      (educationalMaterialID: number): void => {
        this.educationalMaterialID = educationalMaterialID
      }
    )
    this.subscriptionLanguage = this.koodistoService.languages$.subscribe(
      (languages: Language[]): void => {
        this.languages = languages
      }
    )
    this.subscriptionUploadedFiles = this.uploadedFiles$.subscribe(
      (uploadedFiles: UploadedFile[]): void => {
        if (uploadedFiles?.length > 0) {
          this.lastIndexOfUploadedFiles = uploadedFiles.length - 1
        }
      }
    )
    this.koodistoService.updateLanguages()
    this.savedData = JSON.parse(sessionStorage.getItem(this.savedDataKey))
    if (this.savedData) {
      if (this.savedData.name) {
        this.form.get('name').patchValue(this.savedData.name)
      }
    }
  }

  ngOnDestroy(): void {
    if (this.submitted === false && this.form.dirty && this.form.valid) {
      this.saveData()
    }
    this.subscriptionEducationalMaterialID.unsubscribe()
    this.subscriptionLanguage.unsubscribe()
    this.subscriptionLanguageChange.unsubscribe()
    this.subscriptionUploadedFiles.unsubscribe()
  }

  setLabels(): void {
    this.translate
      .get([
        'forms.common.uploadActive',
        'forms.common.uploadError',
        'forms.common.uploadEncrypted',
        'titles.addMaterial.main',
        'titles.addMaterial.files',
        'common.serviceName'
      ])
      .subscribe((translations: { [key: string]: string }): void => {
        this.titleSvc.setTitle(
          `${translations['titles.addMaterial.main']}: ${translations['titles.addMaterial.files']} - ${translations['common.serviceName']}`
        )
        this.uploadActiveText = translations['forms.common.uploadActive']
        this.uploadErrorText = translations['forms.common.uploadError']
        this.uploadEncryptedText = translations['forms.common.uploadEncrypted']
      })
  }

  updateLanguages(): void {
    // set other than current language to an array
    this.otherLangs = this.translate
      .getLangs()
      .filter((lang: string): boolean => lang !== this.lang)
  }

  get name(): FormControl {
    return this.form.get(`name.${this.lang}`) as FormControl
  }

  get names(): FormGroup {
    return this.form.get('name') as FormGroup
  }

  get files(): FormArray {
    return this.form.get('files') as FormArray
  }

  createFile(): FormGroup {
    return this.fb.group({
      file: [''],
      link: this.fb.control(null, [
        Validators.pattern(validatorParams.file.link.pattern),
        Validators.maxLength(validatorParams.file.link.maxLength)
      ]),
      language: this.fb.control(this.lang),
      displayName: this.fb.group({
        fi: this.fb.control(null, [
          Validators.maxLength(validatorParams.file.displayName.maxLength),
          textInputValidator()
        ]),
        sv: this.fb.control(null, [
          Validators.maxLength(validatorParams.file.displayName.maxLength),
          textInputValidator()
        ]),
        en: this.fb.control(null, [
          Validators.maxLength(validatorParams.file.displayName.maxLength),
          textInputValidator()
        ])
      }),
      subtitles: this.fb.array([])
    })
  }

  addFile(): void {
    this.files.push(this.createFile())
  }

  createSubtitle(): FormGroup {
    return this.fb.group({
      file: [''],
      default: this.fb.control(false),
      kind: this.fb.control(SubtitleKind.subtitles),
      label: this.fb.control(null, [
        Validators.maxLength(validatorParams.file.subtitle.label.maxLength),
        textInputValidator()
      ]),
      srclang: this.fb.control(null)
    })
  }

  addSubtitle(i: number): void {
    const subtitles: FormArray = this.files.at(i).get('subtitles') as FormArray
    subtitles.push(this.createSubtitle())
  }

  removeSubtitle(i: number, j: number): void {
    const subtitles: FormArray = this.files.at(i).get('subtitles') as FormArray
    subtitles.removeAt(j)
  }

  openModal(template: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-dialog-centered' })
    )
  }

  onFileChange(event: Event, i: number): void {
    if ((event.target as HTMLInputElement).files.length > 0) {
      const file: File = (event.target as HTMLInputElement).files[0]

      if (mimeTypes.video.includes(file.type)) {
        this.addSubtitle(i)
        this.videoFiles.push(i)
      } else {
        const subtitles: FormArray = this.files.at(i).get('subtitles') as FormArray
        subtitles.clear()
        this.videoFiles = this.videoFiles.filter((v: number): boolean => v !== i)
      }
      this.files.at(i).get('file').setValue(file)
      // remove extension from filename
      const fileName: string = file.name.replace(/\.[^/.]+$/, '').replace(textInputRe, '')
      // this.files.at(i).get(`displayName.${this.lang}`).setValue(fileName);
      this.files.at(i).get(`displayName.fi`).setValue(fileName)
      this.files.at(i).get(`displayName.en`).setValue(fileName)
      this.files.at(i).get(`displayName.sv`).setValue(fileName)
    }
  }

  onSubtitleChange(event: Event, i: number, j: number): void {
    if ((event.target as HTMLInputElement).files.length > 0) {
      const subtitle: File = (event.target as HTMLInputElement).files[0]
      const subtitles: FormArray = <FormArray>this.files.at(i).get('subtitles')

      subtitles.at(j).get('file').setValue(subtitle)

      // add validators
      subtitles.at(j).get('kind').setValidators([Validators.required])
      subtitles.at(j).get('kind').updateValueAndValidity()

      subtitles
        .at(j)
        .get('label')
        .setValidators([
          Validators.required,
          Validators.maxLength(validatorParams.file.subtitle.label.maxLength),
          textInputValidator()
        ])
      subtitles.at(j).get('label').updateValueAndValidity()

      subtitles.at(j).get('srclang').setValidators([Validators.required])
      subtitles.at(j).get('srclang').updateValueAndValidity()
    }
  }

  updateDefaultSubtitle(_event: Event, i: number, j: number): void {
    const subtitles: FormArray = this.files.at(i).get('subtitles') as FormArray
    subtitles.controls.forEach((subCtrl: AbstractControl, x: number): void => {
      if (x !== j) {
        subCtrl.get('default').setValue(false)
      }
    })
  }

  validateFiles(): void {
    this.files.controls = this.files.controls.filter(
      (ctrl: AbstractControl) =>
        ctrl.get('file').value !== '' ||
        (ctrl.get('link').value !== null && ctrl.get('link').value !== '')
    )
    this.files.controls.forEach((ctrl: AbstractControl): void => {
      this.totalFileCount++
      const language = ctrl.get('language')
      const displayName = ctrl.get(`displayName.${this.lang}`)
      language.setValidators([Validators.required])
      language.updateValueAndValidity()
      displayName.setValidators([
        Validators.required,
        Validators.maxLength(validatorParams.file.displayName.maxLength),
        textInputValidator()
      ])
      displayName.updateValueAndValidity()
    })
  }

  validateSubtitles(): void {
    this.files.controls.forEach((fileCtrl: AbstractControl): void => {
      const subtitles: FormArray = fileCtrl.get('subtitles') as FormArray
      if (subtitles.value.length > 0) {
        subtitles.controls.forEach((subCtrl: AbstractControl): void => {
          if (!subCtrl.get('file').value) {
            subtitles.removeAt(
              subtitles.controls.findIndex((sub: AbstractControl): boolean => sub === subCtrl)
            )
          }
        })
        this.totalFileCount = this.totalFileCount + subtitles.controls.length
      }
    })
  }

  uploadFiles(): void {
    this.emitterUploadActive.emit(true)
    this.uploadActive = true
    this.concurrentTasks = []
    this.files.value.forEach((file, i): void => {
      if (file.link) {
        // Append a link upload task if available.
        this.concurrentTasks.push({
          observable: this.materialService.postLinks({
            link: file.link,
            displayName: file.displayName,
            language: file.language,
            priority: this.lastIndexOfUploadedFiles + i
          }),
          metadata: file
        })
      } else {
        const formData: FormData = new FormData()
        formData.append('file', file.file, validateFilename(file.file.name))
        formData.append(
          'fileDetails',
          JSON.stringify({
            displayName: file.displayName,
            language: file.language,
            priority: this.lastIndexOfUploadedFiles + i
          })
        )
        // Append a file upload task if available.
        this.concurrentTasks.push({
          observable: this.materialService.uploadSingleFileToEducationalMaterial(formData),
          metadata: file
        })
      }
    })

    // Run concurrent tasks and finally upload subtitles if available.
    this.materialService.runConcurrentTasks(this.concurrentTasks, this.completedIndexes).subscribe(
      (results: { results: UploadMessage; metadata: any }[]): void => {
        const subtitleUploads: Observable<any>[] = []
        results.forEach((res: { results: UploadMessage; metadata: any }): void => {
          if (res.results.response && res.metadata.subtitles.length > 0) {
            res.metadata.subtitles.forEach((subtitle): void => {
              const subFormData: FormData = new FormData()
              subFormData.append('attachment', subtitle.file, validateFilename(subtitle.file.name))
              subFormData.append(
                'attachmentDetails',
                JSON.stringify({
                  default: subtitle.default,
                  kind: subtitle.kind,
                  label: subtitle.label,
                  srclang: subtitle.srclang
                })
              )
              subtitleUploads.push(
                this.materialService.uploadSubtitle(
                  res.results.response.material[0].id,
                  subFormData
                )
              )
            })
          }
        })
        if (subtitleUploads.length > 0) {
          forkJoin(subtitleUploads).subscribe(
            (attachments: { id: string }[]): void => {
              attachments.forEach((attachment: { id: string }): void => {
                if (attachment.id) {
                  this.completedUploads++
                }
              })
              this.materialService
                .updateUploadedFiles(this.materialService.getEducationalMaterialID())
                .subscribe({
                  error: (err) =>
                    console.error('Update of uploaded files failed in the files tab:', err),
                  complete: () => this.completeUpload()
                })
            },
            (err) => console.error(err)
          )
        } else {
          this.materialService
            .updateUploadedFiles(this.materialService.getEducationalMaterialID())
            .subscribe({
              error: (err) =>
                console.error('Update of uploaded files failed in the files tab:', err),
              complete: () => this.completeUpload()
            })
        }
      },
      (error): void => {
        this.hasUploadIssues = true
        if (error.name === 'TimeoutError') {
          console.error('Upload interrupted due to inactivity')
        } else {
          console.error('Upload error:', error)
        }
      }
    )
  }

  calculateTotalFileCount(): void {
    this.totalFileCount += this.files.value.length
    this.files.value.forEach((file): void => {
      this.totalFileCount += file.subtitles.length
    })
  }

  clearUploadInformationAndContinue(): void {
    // this.subscriptionConcurrentTasks.unsubscribe();
    this.emitterUploadActive.emit(false)
    this.form.reset()
    this.submitted = false
    this.uploadActive = false
    this.completedIndexes.clear()
    this.materialService.clearUploadResponses()
    void this.router.navigate(['/lisaa-oppimateriaali', 2])
  }

  completeUpload(): void {
    // this.subscriptionConcurrentTasks.unsubscribe();
    this.emitterUploadActive.emit(false)
    const uploadResponses: UploadMessage[] = this.materialService.getUploadResponses()
    uploadResponses.forEach((uploadResponse: UploadMessage, index: number): void => {
      if (!this.completedIndexes.has(index) && uploadResponse.status === 'completed') {
        this.completedUploads++
        this.completedIndexes.add(index)
      }
      if (uploadResponse.statusHTTP === 415 && !this.hasEncryptedFiles) {
        this.hasEncryptedFiles = true
      }
    })
    if (this.totalFileCount === 0) {
      this.calculateTotalFileCount()
    }
    this.submitted = false
    this.uploadActive = false
    if (this.completedUploads === this.totalFileCount) {
      this.completedIndexes.clear()
      this.materialService.clearUploadResponses()
      void this.router.navigate(['/lisaa-oppimateriaali', 2])
    } else {
      // console.log('RESPONSES:', this.materialService.getUploadResponses());
      // console.log('COMPLETED:', this.completedIndexes);
      this.hasUploadIssues = true
    }
  }

  setMaterialObsoleted(fileId: number): void {
    this.materialService.setMaterialObsoleted(fileId).subscribe({
      error: (err) => console.error('File deletion failed:', err),
      complete: (): void => {
        this.materialService.updateUploadedFiles(this.educationalMaterialID).subscribe({
          error: (err): void =>
            console.error(`Updating the uploaded files failed in file deletion: ${err}`)
        })
      }
    })
  }

  setAttachmentObsoleted(attachmentId: number): void {
    this.materialService
      .setAttachmentObsoleted(this.materialService.getEducationalMaterialID(), attachmentId)
      .subscribe({
        error: (err) => console.error(err),
        complete: () =>
          this.materialService
            .updateUploadedFiles(this.materialService.getEducationalMaterialID())
            .subscribe({
              error: (err): void =>
                console.error(
                  `Updating the uploaded files failed after setting an attachment obsoleted: ${err}`
                )
            })
      })
  }

  onSubmit(): void {
    this.hasUploadIssues = false
    this.submitted = true
    if (this.authService.hasUserData()) {
      this.validateFiles()
      this.validateSubtitles()
      // console.log('VALID:', this.form.valid);
      if (this.form.valid) {
        if (this.form.dirty) {
          this.saveData()
        }
        if (this.totalFileCount > 0) {
          // Create new empty framework for the educational material.
          if (!this.materialService.getEducationalMaterialID()) {
            const formData: FormData = new FormData()
            formData.append('name', JSON.stringify(this.names.value))
            this.materialService.createEmptyEducationalMaterial(formData).subscribe(
              (educationalMaterialID: number): void => {
                this.emitterEducationalMaterialID.emit(educationalMaterialID)
                // this.materialService.setEducationalMaterialID(educationalMaterialID);
              },
              (err) =>
                console.error('Create empty framework request failed in the file upload:', err),
              () => this.uploadFiles()
            )
          } else {
            this.uploadFiles()
          }
        } else {
          void this.router.navigate(['/lisaa-oppimateriaali', 2])
          return
        }
      }
      this.totalFileCount = 0
    } else {
      this.form.reset()
      this.form.markAsPristine()
      void this.router.navigateByUrl('/etusivu')
    }
  }

  saveData(): void {
    const data = Object.assign({}, JSON.parse(sessionStorage.getItem(this.savedDataKey)), {
      name: this.names.value
    })
    // Save data to session storage
    sessionStorage.setItem(this.savedDataKey, JSON.stringify(data))
  }

  /**
   * Emits EventEmitter indicating user wants to abort.
   */
  abort(): void {
    this.emitterUploadActive.emit(false)
    this.emitterAbort.emit(true)
  }
}
