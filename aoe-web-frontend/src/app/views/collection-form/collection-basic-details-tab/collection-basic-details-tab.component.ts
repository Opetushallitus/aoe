import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef
} from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { KeyValue } from '@angular/common'
import { Router } from '@angular/router'
import { Title } from '@angular/platform-browser'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { ImageCroppedEvent } from 'ngx-image-cropper'
import { Subscription } from 'rxjs'
import { environment } from '../../../../environments/environment'
import {
  addCustomItem,
  descriptionValidator,
  textInputValidator
} from '../../../shared/shared.module'
import { KoodistoService } from '@services/koodisto.service'
import { CollectionService } from '@services/collection.service'
import { validatorParams } from '@constants/validator-params'
import { CollectionForm } from '@models/collections/collection-form'
import { EducationalRole } from '@models/koodisto/educational-role'
import { EducationalUse } from '@models/koodisto/educational-use'
import { Language } from '@models/koodisto/language'
import { AccessibilityFeature } from '@models/koodisto/accessibility-feature'
import { AccessibilityHazard } from '@models/koodisto/accessibility-hazard'
import { UploadMessage } from '@models/upload-message'

@Component({
    selector: 'app-collection-basic-details-tab',
    templateUrl: './collection-basic-details-tab.component.html',
    styleUrls: ['./collection-basic-details-tab.component.scss'],
    standalone: false
})
export class CollectionBasicDetailsTabComponent implements OnInit, OnDestroy {
  @Input() collection: CollectionForm
  @Input() collectionId: string
  @Input() tabId: number
  @Output() abortForm = new EventEmitter()
  form: FormGroup
  lang = this.translate.currentLang
  submitted = false
  keywordSubscription: Subscription
  keywords: KeyValue<string, string>[]
  addCustomItem = addCustomItem
  educationalRoleSubscription: Subscription
  educationalRoles: EducationalRole[]
  educationalUseSubscription: Subscription
  educationalUses: EducationalUse[]
  languageSubscription: Subscription
  languages: Language[]
  accessibilityFeatureSubscription: Subscription
  accessibilityFeatures: AccessibilityFeature[]
  accessibilityHazardSubscription: Subscription
  accessibilityHazards: AccessibilityHazard[]
  thumbnailModalRef: BsModalRef
  uploadResponse: UploadMessage = { status: '', message: 0 }
  imageChangedEvent: any = ''
  croppedImage: string
  thumbnailSrc: string
  serviceName: string

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private router: Router,
    private titleService: Title,
    private koodistoService: KoodistoService,
    private modalService: BsModalService,
    private collectionService: CollectionService
  ) {}

  ngOnInit(): void {
    this.setTitle()

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang

      this.setTitle()

      this.koodistoService.updateKeywords()
      this.koodistoService.updateEducationalRoles()
      this.koodistoService.updateEducationalUses()
      this.koodistoService.updateLanguages()
      this.koodistoService.updateAccessibilityFeatures()
      this.koodistoService.updateAccessibilityHazards()
    })

    this.form = this.fb.group({
      name: this.fb.control(null, [
        Validators.maxLength(validatorParams.name.maxLength),
        textInputValidator()
      ]),
      description: this.fb.control(null, [
        Validators.maxLength(validatorParams.description.maxLength),
        descriptionValidator()
      ]),
      keywords: this.fb.control(null),
      educationalRoles: this.fb.control(null),
      educationalUses: this.fb.control(null),
      languages: this.fb.control(null),
      accessibilityFeatures: this.fb.control(null),
      accessibilityHazards: this.fb.control(null)
    })

    if (sessionStorage.getItem(environment.collection) === null) {
      this.form.patchValue(this.collection)
    } else {
      this.form.patchValue(JSON.parse(sessionStorage.getItem(environment.collection)))
    }

    this.thumbnailSrc = this.collection.thumbnail

    // keywords
    this.keywordSubscription = this.koodistoService.keywords$.subscribe(
      (keywords: KeyValue<string, string>[]) => {
        this.keywords = keywords
      }
    )
    this.koodistoService.updateKeywords()

    // educational roles
    this.educationalRoleSubscription = this.koodistoService.educationalRoles$.subscribe(
      (roles: EducationalRole[]) => {
        this.educationalRoles = roles
      }
    )
    this.koodistoService.updateEducationalRoles()

    // educational uses
    this.educationalUseSubscription = this.koodistoService.educationalUses$.subscribe(
      (uses: EducationalUse[]) => {
        this.educationalUses = uses
      }
    )
    this.koodistoService.updateEducationalUses()

    // languages
    this.languageSubscription = this.koodistoService.languages$.subscribe(
      (languages: Language[]) => {
        this.languages = languages
      }
    )
    this.koodistoService.updateLanguages()

    // accessibility features
    this.accessibilityFeatureSubscription = this.koodistoService.accessibilityFeatures$.subscribe(
      (features: AccessibilityFeature[]) => {
        this.accessibilityFeatures = features
      }
    )
    this.koodistoService.updateAccessibilityFeatures()

    // accessibility hazards
    this.accessibilityHazardSubscription = this.koodistoService.accessibilityHazards$.subscribe(
      (hazards: AccessibilityHazard[]) => {
        this.accessibilityHazards = hazards
      }
    )
    this.koodistoService.updateAccessibilityHazards()
  }

  ngOnDestroy(): void {
    if (this.submitted === false && this.form.dirty && this.form.valid) {
      this.saveCollection()
    }

    this.keywordSubscription.unsubscribe()
    this.educationalRoleSubscription.unsubscribe()
    this.educationalUseSubscription.unsubscribe()
    this.languageSubscription.unsubscribe()
    this.accessibilityFeatureSubscription.unsubscribe()
    this.accessibilityHazardSubscription.unsubscribe()
  }

  /**
   * Updates page title.
   */
  setTitle(): void {
    this.translate
      .get(['common.serviceName', 'titles.collection.main', 'titles.collection.basic'])
      .subscribe((translations: { [key: string]: string }) => {
        this.serviceName = translations['common.serviceName']
        this.titleService.setTitle(
          `${translations['titles.collection.main']}: ${translations['titles.collection.basic']} - ${this.serviceName}`
        )
      })
  }

  get nameCtrl(): FormControl {
    return this.form.get('name') as FormControl
  }

  get descriptionCtrl(): FormControl {
    return this.form.get('description') as FormControl
  }

  /**
   * Shows modal for uploading thumbnail.
   * @param {TemplateRef<any>} template
   */
  openThumbnailModal(template: TemplateRef<any>): void {
    this.thumbnailModalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-dialog-centered' })
    )
  }

  imageChange(event: Event): void {
    this.imageChangedEvent = event
  }

  /**
   * Updates croppedImage.
   * @param {ImageCroppedEvent} event
   */
  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event.base64
  }

  /**
   * Uploads thumbnail to backend.
   */
  uploadImage(): void {
    if (this.croppedImage) {
      this.collectionService.uploadImage(this.croppedImage, this.collectionId).subscribe(
        (res: UploadMessage) => {
          this.uploadResponse = res
        },
        (err) => console.error(err),
        () => {
          const changedCollection: CollectionForm =
            sessionStorage.getItem(environment.collection) !== null
              ? JSON.parse(sessionStorage.getItem(environment.collection))
              : this.collection

          changedCollection.thumbnail = this.croppedImage

          sessionStorage.setItem(environment.collection, JSON.stringify(changedCollection))

          this.thumbnailSrc = this.croppedImage
          this.thumbnailModalRef.hide()
        }
      )
    }
  }

  /**
   * Runs on submit. Redirects user to the next tab if form is valid.
   */
  onSubmit(): void {
    this.submitted = true

    if (this.form.valid) {
      if (this.form.dirty) {
        this.saveCollection()
      }

      void this.router.navigate(['/kokoelma', this.collectionId, 'muokkaa', this.tabId + 1])
    }
  }

  /**
   * Saves collection to session storage.
   */
  saveCollection(): void {
    const changedCollection: CollectionForm =
      sessionStorage.getItem(environment.collection) !== null
        ? JSON.parse(sessionStorage.getItem(environment.collection))
        : this.collection

    changedCollection.name = this.form.get('name').value
    changedCollection.description = this.form.get('description').value
    changedCollection.keywords = this.form.get('keywords').value
    changedCollection.educationalRoles = this.form.get('educationalRoles').value
    changedCollection.educationalUses = this.form.get('educationalUses').value
    changedCollection.languages = this.form.get('languages').value
    changedCollection.accessibilityFeatures = this.form.get('accessibilityFeatures').value
    changedCollection.accessibilityHazards = this.form.get('accessibilityHazards').value

    sessionStorage.setItem(environment.collection, JSON.stringify(changedCollection))
  }

  /**
   * Emits EventEmitter indicating user wants to abort.
   */
  emitAbort(): void {
    this.abortForm.emit()
  }
}
