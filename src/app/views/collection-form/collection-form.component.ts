import { Component, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { CollectionService } from '@services/collection.service';
import { ToastrService } from 'ngx-toastr';
import { CollectionForm } from '@models/collections/collection-form';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Toast } from '@models/translations/toast';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
// tslint:disable-next-line:max-line-length
import { CollectionBasicDetailsTabComponent } from '@views/collection-form/collection-basic-details-tab/collection-basic-details-tab.component';
// tslint:disable-next-line:max-line-length
import { CollectionEducationalDetailsTabComponent } from '@views/collection-form/collection-educational-details-tab/collection-educational-details-tab.component';
import { CollectionMaterialsTabComponent } from '@views/collection-form/collection-materials-tab/collection-materials-tab.component';
import { CollectionPreviewTabComponent } from '@views/collection-form/collection-preview-tab/collection-preview-tab.component';

@Component({
  selector: 'app-collection-form',
  templateUrl: './collection-form.component.html',
  styleUrls: ['./collection-form.component.scss']
})
export class CollectionFormComponent implements OnInit, OnDestroy {
  collectionId: string;
  tabId: number;
  routeSubscription: Subscription;
  collection: CollectionForm;
  collectionSubscription: Subscription;
  confirmAbortModalRef: BsModalRef;
  noPermissionTitle: string;
  noPermissionMessage: string;
  abortMessage: string;
  @ViewChild(CollectionBasicDetailsTabComponent) basicTab: CollectionBasicDetailsTabComponent;
  @ViewChild(CollectionEducationalDetailsTabComponent) educationalTab: CollectionEducationalDetailsTabComponent;
  @ViewChild(CollectionMaterialsTabComponent) materialsTab: CollectionMaterialsTabComponent;
  @ViewChild(CollectionPreviewTabComponent) previewTab: CollectionPreviewTabComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private collectionSvc: CollectionService,
    private toastr: ToastrService,
    private modalSvc: BsModalService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.collectionId = this.route.snapshot.paramMap.get('collectionId');

    this.translate.get('forms.collection.toasts.noPermission').subscribe((translation: Toast) => {
      this.noPermissionTitle = translation.title;
      this.noPermissionMessage = translation.message;
    });

    this.translate.get('forms.editEducationalResource.abort.text').subscribe((translation: string) => {
      this.abortMessage = translation;
    });

    this.routeSubscription = this.route.paramMap.subscribe((params: Params) => {
      this.tabId = +params.get('tabId');

      if (!this.tabId) {
        return this.router.navigate(['/kokoelma', this.collectionId, 'muokkaa', 1]);
      }
    });

    this.collectionSubscription = this.collectionSvc.editCollection$.subscribe((collection: CollectionForm) => {
      this.collection = collection;

      if (JSON.stringify(collection) === '{}') {
        // @todo: replace with translation strings
        // tslint:disable-next-line:max-line-length
        this.toastr.error(this.noPermissionMessage, this.noPermissionTitle);

        return this.router.navigate(['/etusivu']);
      }
    });
    this.collectionSvc.updateEditCollection(this.collectionId);
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
    this.collectionSubscription.unsubscribe();

    sessionStorage.removeItem(environment.collection);
  }

  /**
   * Shows confirm modal for abort.
   * @param {TemplateRef<any>} template
   */
  openConfirmAbortModal(template: TemplateRef<any>): void {
    this.confirmAbortModalRef = this.modalSvc.show(template);
  }

  /**
   * Removes collection from session storage. Redirects user to user materials view.
   */
  abort(): void {
    sessionStorage.removeItem(environment.collection);

    this.confirmAbortModalRef.hide();

    this.router.navigate(['/omat-oppimateriaalit']);
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    if (
      this.basicTab?.form.dirty
      || this.educationalTab?.form.dirty
      || this.materialsTab?.form.dirty
    ) {
      return confirm(this.abortMessage);
    }

    if (this.previewTab?.canDeactivate) {
      return true;
    }

    const changedCollection: CollectionForm = JSON.parse(sessionStorage.getItem(environment.collection));

    if (changedCollection) {
      return changedCollection === this.collection
        ? true
        : confirm(this.abortMessage);
    }

    return true;
  }
}
