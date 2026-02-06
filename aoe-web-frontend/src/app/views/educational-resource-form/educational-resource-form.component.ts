import { Component, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { ActivatedRoute, Params, Router } from '@angular/router'
import { Observable, Subscription } from 'rxjs'
import { environment } from '@environments/environment'
import {
  BasedOnDetailsComponent,
  BasicDetailsComponent,
  EducationalDetailsComponent,
  ExtendedDetailsComponent,
  FilesComponent,
  LicenseComponent,
  PreviewComponent
} from './tabs'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'
import { MaterialService } from '@services/material.service'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { UploadedFile } from '@models/uploaded-file'
import { KoodistoService } from '@services/koodisto.service'

@Component({
  selector: 'app-educational-resource-form',
  templateUrl: './educational-resource-form.component.html',
  standalone: false
})
export class EducationalResourceFormComponent implements OnInit, OnDestroy {
  tabId: number
  abortMessage: string
  confirmModalRef: BsModalRef
  uploadActive: boolean = false

  educationalMaterialID$: Observable<number> = this.materialService.educationalMaterialID$
  uploadedFiles$: Observable<UploadedFile[]> = this.materialService.uploadedFiles$

  @ViewChild(FilesComponent) filesTab: FilesComponent
  @ViewChild(BasicDetailsComponent) basicTab: BasicDetailsComponent
  @ViewChild(EducationalDetailsComponent) educationalTab: EducationalDetailsComponent
  @ViewChild(ExtendedDetailsComponent) extendedTab: ExtendedDetailsComponent
  @ViewChild(LicenseComponent) licenseTab: LicenseComponent
  @ViewChild(BasedOnDetailsComponent) referencesTab: BasedOnDetailsComponent
  @ViewChild(PreviewComponent) previewTab: PreviewComponent

  constructor(
    private koodistoService: KoodistoService,
    private materialService: MaterialService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService
  ) {}

  subscriptionRoute: Subscription
  subscriptionLanguageChange: Subscription
  subscriptionTranslate: Subscription

  ngOnInit(): void {
    this.koodistoService.updateLicenses().subscribe()
    this.subscriptionRoute = this.route.params.subscribe((params: Params): void => {
      this.tabId = params['tabId'] ? +params['tabId'] : 1
      if (!params['tabId']) {
        void this.router.navigate(['/lisaa-oppimateriaali', 1])
      }
    })
    this.subscriptionTranslate = this.translate
      .get('forms.editEducationalResource.abort.text')
      .subscribe((translation: string): void => {
        this.abortMessage = translation
      })
    this.subscriptionLanguageChange = this.translate.onLangChange.subscribe(
      (event: LangChangeEvent): void => {
        this.koodistoService.updateLicenses(event.lang).subscribe()
      }
    )
  }

  ngOnDestroy(): void {
    this.subscriptionRoute.unsubscribe()
    this.subscriptionLanguageChange.unsubscribe()
    this.subscriptionTranslate.unsubscribe()
    sessionStorage.removeItem(environment.newERLSKey)
    this.materialService.clearEducationalMaterialID()
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
    return this.materialService.getEducationalMaterialID() ? confirm(this.abortMessage) : true
  }

  setUploadActive(uploadActive: boolean): void {
    this.uploadActive = uploadActive
  }

  updateEducationalMaterialID(educationalMaterialID: number): void {
    this.materialService.setEducationalMaterialID(educationalMaterialID)
  }

  /**
   * Shows confirm modal for abort.
   * @param message
   * @param {TemplateRef<any>} template
   */
  openConfirmModal(message: boolean, template: TemplateRef<any>): void {
    this.confirmModalRef = this.modalService.show(template)
  }

  /**
   * Removes edit material from session storage. Redirects user to user materials view.
   */
  abort(): void {
    this.materialService.clearEducationalMaterialEditForm()
    this.materialService.clearEducationalMaterialID()
    this.materialService.clearUploadedFiles()
    this.materialService.clearUploadResponses()
    void this.router.navigate(['/omat-oppimateriaalit'])
    this.confirmModalRef.hide()
  }
}
