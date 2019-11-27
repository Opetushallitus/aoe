import { Component, Input, OnInit } from '@angular/core';

import { Material } from '../../models/material';

@Component({
  selector: 'app-office-preview',
  templateUrl: './office-preview.component.html',
})
export class OfficePreviewComponent implements OnInit {
  @Input() material: Material;
  iframeSrc: string;

  ngOnInit(): void {
    const materialUri = encodeURIComponent(`https://demo.aoe.fi/api/download/${this.material.filekey}`);
    this.iframeSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${materialUri}`;
  }
}
