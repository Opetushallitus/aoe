import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { Material } from '@models/material';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pdf-preview',
  templateUrl: './pdf-preview.component.html',
})
export class PdfPreviewComponent implements OnInit, OnChanges {
  @Input() material: Material;
  @Input() isCollection = false;
  materialUrl: string;

  ngOnInit(): void {
    this.materialUrl = `${environment.backendUrl}/download/${this.material.filekey}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.materialUrl = `${environment.backendUrl}/download/${this.material.filekey}`;
  }
}
