import { Component, Input, OnInit } from '@angular/core';
import { CollectionCard } from '@models/collections/collection-card';
import { getValuesWithinLimits } from '../../shared/shared.module';

@Component({
  selector: 'app-collection-card',
  templateUrl: './collection-card.component.html',
  styleUrls: ['./collection-card.component.scss']
})
export class CollectionCardComponent implements OnInit {
  @Input() collection: CollectionCard;
  keywords: any[];

  constructor() { }

  ngOnInit(): void {
    this.keywords = getValuesWithinLimits(this.collection.keywords, 'value');
  }
}
