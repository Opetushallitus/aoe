import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-preview-row',
  templateUrl: './preview-row.component.html',
  styleUrls: ['./preview-row.component.scss']
})
export class PreviewRowComponent implements OnInit {
  @Input() title: string;
  @Input() items?: any[];
  @Input() item?: string;
  @Input() property?: string;

  constructor() { }

  ngOnInit(): void {
  }

}
