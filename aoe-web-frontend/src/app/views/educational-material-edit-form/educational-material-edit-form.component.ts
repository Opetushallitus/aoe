import { Component, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { ActivatedRoute, Params, Router } from '@angular/router'
import { MaterialService } from '@services/material.service'
import { Observable, Subscription } from 'rxjs'
import { EducationalMaterialForm } from '@models/educational-material-form'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { ToastrService } from 'ngx-toastr'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'
import { Toast } from '@models/translations/toast'
import { KoodistoService } from '@services/koodisto.service'
import {
  EditBasedOnDetailsComponent,
  EditBasicDetailsComponent,
  EditEducationalDetailsComponent,
  EditExtendedDetailsComponent,
  EditFilesComponent,
  EditLicenseComponent,
  EditPreviewComponent
} from './tabs'

@Component({
    selector: 'app-educational-material-edit-form',
    templateUrl: './educational-material-edit-form.component.html',
    styleUrls: ['./educational-material-edit-form.component.scss'],
    standalone: false
})
export class EducationalMaterialEditFormComponent implements OnInit, OnDestroy {
  educationalMaterialEditForm: EducationalMaterialForm
  educationalMaterialID: number
  tabId: number
  confirmModalRef: BsModalRef
  noPermissionTitle: string
  noPermissionMessage: string
  abortMessage: string

  educationalMaterialEditForm$: Observable<EducationalMaterialForm> =
    this.materialService.educationalMaterialEditForm$

  subscriptionEducationalMaterialEditForm: Subscription
  subscriptionRoute: Subscription
  subscriptionTranslateAbort: Subscription
  subscriptionTranslatePermission: Subscription
  subscriptionUpdateUploadedFiles: Subscription
  subscriptionLanguageChange: Subscription

  @ViewChild(EditFilesComponent) filesTab: EditFilesComponent
  @ViewChild(EditBasicDetailsComponent) basicTab: EditBasicDetailsComponent
  @ViewChild(EditEducationalDetailsComponent) educationalTab: EditEducationalDetailsComponent
  @ViewChild(EditExtendedDetailsComponent) extendedTab: EditExtendedDetailsComponent
  @ViewChild(EditLicenseComponent) licenseTab: EditLicenseComponent
  @ViewChild(EditBasedOnDetailsComponent) referencesTab: EditBasedOnDetailsComponent
  @ViewChild(EditPreviewComponent) previewTab: EditPreviewComponent

  constructor(
    private koodistoService: KoodistoService,
    private materialService: MaterialService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.koodistoService.updateLicenses().subscribe()
    this.educationalMaterialID = +this.route.snapshot.paramMap.get('materialId')
    this.materialService.setEducationalMaterialID(this.educationalMaterialID)
    this.subscriptionUpdateUploadedFiles = this.materialService
      .updateUploadedFiles(this.educationalMaterialID)
      .subscribe({
        error: (err) =>
          console.error(
            `Updating the file information of EMID=${this.educationalMaterialID} failed:`,
            err
          )
      })
    this.subscriptionEducationalMaterialEditForm = this.materialService
      .updateEducationalMaterialEditForm(this.educationalMaterialID)
      .subscribe(
        (educationalMaterialForm: EducationalMaterialForm): void => {
          this.materialService.setEducationalMaterialEditForm(educationalMaterialForm)
          this.educationalMaterialEditForm = educationalMaterialForm
        },
        (err): void => {
          this.toastr.error(this.noPermissionMessage, this.noPermissionTitle)
          console.error(err)
          void this.router.navigate(['/etusivu'])
        }
      )
    this.subscriptionTranslatePermission = this.translate
      .get('forms.editEducationalResource.toasts.noPermission')
      .subscribe((translation: Toast): void => {
        this.noPermissionTitle = translation.title
        this.noPermissionMessage = translation.message
      })
    this.subscriptionTranslateAbort = this.translate
      .get('forms.editEducationalResource.abort.text')
      .subscribe((translation: string): void => {
        this.abortMessage = translation
      })
    this.subscriptionRoute = this.route.paramMap.subscribe((params: Params): void => {
      this.tabId = +params.get('tabId')
      if (!this.tabId) {
        void this.router.navigate(['/muokkaa-oppimateriaalia', this.educationalMaterialID, 1])
      }
    })
    this.subscriptionLanguageChange = this.translate.onLangChange.subscribe(
      (event: LangChangeEvent): void => {
        this.koodistoService.updateLicenses(event.lang).subscribe()
      }
    )
  }

  ngOnDestroy(): void {
    this.materialService.clearEducationalMaterialEditForm()
    this.subscriptionEducationalMaterialEditForm.unsubscribe()
    this.subscriptionRoute.unsubscribe()
    this.subscriptionTranslateAbort.unsubscribe()
    this.subscriptionTranslatePermission.unsubscribe()
    this.subscriptionUpdateUploadedFiles.unsubscribe()
    this.subscriptionLanguageChange.unsubscribe()
  }

  /**
   * Shows confirm modal for abort.
   * @param {TemplateRef<any>} template
   */
  openConfirmModal(template: TemplateRef<any>): void {
    this.confirmModalRef = this.modalService.show(template)
  }

  /**
   * Removes edit material from session storage. Redirects user to user materials view.
   */
  abort(): void {
    this.materialService.clearEducationalMaterialEditForm()
    void this.router.navigate(['/omat-oppimateriaalit'])
    this.confirmModalRef.hide()
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    if (
      this.filesTab?.form.dirty ||
      this.basicTab?.form.dirty ||
      this.educationalTab?.form.dirty ||
      this.extendedTab?.form.dirty ||
      this.licenseTab?.form.dirty ||
      this.referencesTab?.form.dirty
    ) {
      return confirm(this.abortMessage)
    }
    if (this.previewTab?.canDeactivate) {
      return true
    }
    const editMaterial: EducationalMaterialForm =
      this.materialService.getEducationalMaterialEditForm()
    if (editMaterial) {
      return editMaterial === this.educationalMaterialEditForm ? true : confirm(this.abortMessage)
    }
    return true
  }
}
