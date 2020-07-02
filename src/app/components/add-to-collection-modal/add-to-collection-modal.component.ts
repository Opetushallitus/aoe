import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserCollection } from '@models/collections/user-collection';
import { CollectionService } from '@services/collection.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AddToCollectionPost } from '@models/collections/add-to-collection-post';
import { AddToCollectionResponse } from '@models/collections/add-to-collection-response';
import { RemoveFromCollectionPost } from '@models/collections/remove-from-collection-post';
import { TranslateService } from '@ngx-translate/core';
import { Toast } from '@models/translations/toast';

@Component({
  selector: 'app-add-to-collection-modal',
  templateUrl: './add-to-collection-modal.component.html',
  styleUrls: ['./add-to-collection-modal.component.scss']
})
export class AddToCollectionModalComponent implements OnInit, OnDestroy {
  materialId: number;
  newCollectionForm: FormGroup;
  newCollectionSubmitted = false;
  userCollectionSubscription: Subscription;
  userCollections: UserCollection[];
  selectedCollections: number[] = [];
  collectionCreatedToast: Toast;
  addedToCollectionToast: Toast;
  removedFromCollectionToast: Toast;

  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private collectionSvc: CollectionService,
    private toastr: ToastrService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.newCollectionForm = this.fb.group({
      name: this.fb.control(null, [
        Validators.required,
      ]),
    });

    this.userCollectionSubscription = this.collectionSvc.userCollections$.subscribe((collections: UserCollection[]) => {
      this.userCollections = collections;

      collections.forEach((collection: UserCollection) => {
        if (collection.emIds.includes(this.materialId.toString())) {
          this.selectedCollections.push(+collection.id);
        }
      });
    });
    this.collectionSvc.updateUserCollections();

    this.translate.get('collections.toasts.collectionCreated').subscribe((translation: Toast) => {
      this.collectionCreatedToast = translation;
    });

    this.translate.get('collections.toasts.addedToCollection').subscribe((translation: Toast) => {
      this.addedToCollectionToast = translation;
    });

    this.translate.get('collections.toasts.removedFromCollection').subscribe((translation: Toast) => {
      this.removedFromCollectionToast = translation;
    });
  }

  ngOnDestroy(): void {
    this.userCollectionSubscription.unsubscribe();
  }

  get nameCtrl(): FormControl {
    return this.newCollectionForm.get('name') as FormControl;
  }

  onCollectionIdChange($event, collectionId: string): void {
    if ($event.target.checked) {
      this.selectedCollections.push(+collectionId);
    } else {
      this.selectedCollections = this.selectedCollections.filter((collection: number) => collection !== +collectionId);

      const payload: RemoveFromCollectionPost = {
        collectionId: +collectionId,
        emId: [
          this.materialId,
        ],
      };

      this.collectionSvc.removeFromCollection(payload).subscribe(() => {
        // show toast
        this.toastr.success(this.removedFromCollectionToast.message, this.removedFromCollectionToast.title);
      });
    }
  }

  onCreateCollectionSubmit(): void {
    this.newCollectionSubmitted = true;

    if (this.newCollectionForm.valid) {
      if (this.newCollectionForm.dirty) {
        this.collectionSvc.createCollection(this.newCollectionForm.value).subscribe(() => {
          // show toast
          this.toastr.success(this.collectionCreatedToast.message, this.collectionCreatedToast.title);

          // update collections
          this.collectionSvc.updateUserCollections();

          // reset form
          this.newCollectionSubmitted = false;
          this.newCollectionForm.reset();
        });
      }
    }
  }

  onAddToCollectionSubmit(): void {
    if (this.selectedCollections.length > 0) {
      this.selectedCollections.forEach((collection: number) => {
        const payload: AddToCollectionPost = {
          collectionId: collection,
          emId: [
            this.materialId,
          ],
        };

        this.collectionSvc.addToCollection(payload).subscribe((response: AddToCollectionResponse) => {
          if (response.status === 'ok') {
            // show toast
            this.toastr.success(this.addedToCollectionToast.message, this.addedToCollectionToast.title);

            // hide modal
            this.bsModalRef.hide();
          }
        });
      });
    }
  }
}
