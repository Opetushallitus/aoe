import { Component, Input, OnInit } from '@angular/core';

import { Material } from '../../models/material';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-office-preview',
  templateUrl: './office-preview.component.html',
})
export class OfficePreviewComponent implements OnInit {
  @Input() material: Material;
  materialUrl: string;
  iframeSrc: string;

  ngOnInit(): void {
    const materialUri = encodeURIComponent(`${environment.backendUrl}/download/${this.material.filekey}`);
    this.iframeSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${materialUri}`;
    this.materialUrl = `${environment.backendUrl}/download/${this.material.filekey}`;
  }
}
