import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Collection } from '@models/collections/collection';
import { CollectionService } from '@services/collection.service';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-collection-modal',
  templateUrl: './collection-modal.component.html',
  styleUrls: ['./collection-modal.component.scss']
})
export class CollectionModalComponent implements OnInit, OnDestroy {
  newCollectionForm: FormGroup;
  addToCollectionForm: FormGroup;
  userCollectionSubscription: Subscription;
  userCollections: Collection[];

  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private collectionSvc: CollectionService,
  ) { }

  ngOnInit(): void {
    this.newCollectionForm = this.fb.group({
      name: this.fb.control(null, [
        Validators.required,
      ]),
    });

    this.addToCollectionForm = this.fb.group({
      collectionId: this.fb.control(null, [
        Validators.required,
      ]),
      emId: this.fb.control(null, [
        Validators.required,
      ]),
    });

    this.userCollectionSubscription = this.collectionSvc.userCollections$.subscribe((collections: Collection[]) => {
      this.userCollections = collections;
    });
    this.collectionSvc.updateUserCollections();
  }

  ngOnDestroy(): void {
    this.userCollectionSubscription.unsubscribe();
  }

  onCreateCollectionSubmit(): void {}

  onAddToCollectionSubmit(): void {}
}
