import { Component, Input, OnInit } from '@angular/core';
import { CollectionCard, CollectionCardKeyword } from '@models/collections/collection-card';
import { getValuesWithinLimits } from '../../shared/shared.module';

@Component({
  selector: 'app-collection-card',
  templateUrl: './collection-card.component.html',
  styleUrls: ['./collection-card.component.scss']
})
export class CollectionCardComponent implements OnInit {
  @Input() collection: CollectionCard;
  educationalLevels: any[];
  keywords: CollectionCardKeyword[];

  constructor() { }

  ngOnInit(): void {
    this.educationalLevels = getValuesWithinLimits(this.collection.educationalLevels, 'value');
    this.keywords = getValuesWithinLimits(this.collection.keywords, 'value');
  }
}
