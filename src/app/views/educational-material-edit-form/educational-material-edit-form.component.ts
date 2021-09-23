import { Component, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MaterialService } from '@services/material.service';
import { Observable, Subscription } from 'rxjs';
import { EducationalMaterialForm } from '@models/educational-material-form';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Toast } from '@models/translations/toast';
import {
  EditBasedOnDetailsComponent,
  EditBasicDetailsComponent,
  EditEducationalDetailsComponent,
  EditExtendedDetailsComponent,
  EditFilesComponent,
  EditLicenseComponent,
  EditPreviewComponent,
} from './tabs';

@Component({
  selector: 'app-educational-material-edit-form',
  templateUrl: './educational-material-edit-form.component.html',
  styleUrls: ['./educational-material-edit-form.component.scss']
})
export class EducationalMaterialEditFormComponent implements OnInit, OnDestroy {
  materialId: number;
  materialSubscription: Subscription;
  material: EducationalMaterialForm;
  tabId: number;
  routeSubscription: Subscription;
  confirmModalRef: BsModalRef;
  noPermissionTitle: string;
  noPermissionMessage: string;
  abortMessage: string;
  @ViewChild(EditFilesComponent) filesTab: EditFilesComponent;
  @ViewChild(EditBasicDetailsComponent) basicTab: EditBasicDetailsComponent;
  @ViewChild(EditEducationalDetailsComponent) educationalTab: EditEducationalDetailsComponent;
  @ViewChild(EditExtendedDetailsComponent) extendedTab: EditExtendedDetailsComponent;
  @ViewChild(EditLicenseComponent) licenseTab: EditLicenseComponent;
  @ViewChild(EditBasedOnDetailsComponent) referencesTab: EditBasedOnDetailsComponent;
  @ViewChild(EditPreviewComponent) previewTab: EditPreviewComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private materialSvc: MaterialService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.materialId = +this.route.snapshot.paramMap.get('materialId');

    this.translate.get('forms.editEducationalResource.toasts.noPermission').subscribe((translation: Toast) => {
      this.noPermissionTitle = translation.title;
      this.noPermissionMessage = translation.message;
    });

    this.translate.get('forms.editEducationalResource.abort.text').subscribe((translation: string) => {
      this.abortMessage = translation;
    });

    this.materialSubscription = this.materialSvc.editMaterial$.subscribe((material: EducationalMaterialForm) => {
      this.material = material;

      if (this.material === null) {
        this.toastr.error(this.noPermissionMessage, this.noPermissionTitle);

        this.router.navigate(['/etusivu']);
      }
    });
    this.materialSvc.updateEditMaterial(this.materialId);

    this.routeSubscription = this.route.paramMap.subscribe((params: Params) => {
      this.tabId = +params.get('tabId');

      if (!this.tabId) {
        this.router.navigate(['/muokkaa-oppimateriaalia', this.materialId, 1]);
      }
    });
  }

  ngOnDestroy(): void {
    this.materialSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();

    sessionStorage.removeItem(environment.editMaterial);
  }

  /**
   * Shows confirm modal for abort.
   * @param {TemplateRef<any>} template
   */
  openConfirmModal(template: TemplateRef<any>): void {
    this.confirmModalRef = this.modalService.show(template);
  }

  /**
   * Removes edit material from session storage. Redirects user to user materials view.
   */
  abort(): void {
    sessionStorage.removeItem(environment.editMaterial);

    this.router.navigate(['/omat-oppimateriaalit']);

    this.confirmModalRef.hide();
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    if (
      this.filesTab?.form.dirty
      || this.basicTab?.form.dirty
      || this.educationalTab?.form.dirty
      || this.extendedTab?.form.dirty
      || this.licenseTab?.form.dirty
      || this.referencesTab?.form.dirty
    ) {
      return confirm(this.abortMessage);
    }

    if (this.previewTab?.canDeactivate) {
      return true;
    }

    const editMaterial: EducationalMaterialForm = JSON.parse(sessionStorage.getItem(environment.editMaterial));

    if (editMaterial) {
      return editMaterial === this.material
        ? true
        : confirm(this.abortMessage);
    }

    return true;
  }
}
