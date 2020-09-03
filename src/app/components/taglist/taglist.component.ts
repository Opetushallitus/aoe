import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-taglist',
  templateUrl: './taglist.component.html',
  styleUrls: ['./taglist.component.scss']
})
export class TaglistComponent implements OnInit {
  @Input() id: string;
  @Input() tags: any[];
  @Input() title: string;
  @Input() property?: string;

  constructor() { }

  ngOnInit(): void {
  }
}
