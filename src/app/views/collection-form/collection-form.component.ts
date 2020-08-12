import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CollectionService } from '@services/collection.service';
import { ToastrService } from 'ngx-toastr';
import { CollectionForm } from '@models/collections/collection-form';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Toast } from '@models/translations/toast';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

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
}
