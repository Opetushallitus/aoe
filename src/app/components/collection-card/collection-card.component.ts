import { Component, Input, OnInit } from '@angular/core';
import { CollectionCard } from '@models/collections/collection-card';

@Component({
  selector: 'app-collection-card',
  templateUrl: './collection-card.component.html',
  styleUrls: ['./collection-card.component.scss']
})
export class CollectionCardComponent implements OnInit {
  @Input() collection: CollectionCard;

  constructor() { }

  ngOnInit(): void { }
}
