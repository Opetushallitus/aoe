import { Component, Input } from '@angular/core';

import { Material } from '../../models/demo/material';

@Component({
  selector: 'app-pdf-preview',
  templateUrl: './pdf-preview.component.html',
})
export class PdfPreviewComponent {
  @Input() material: Material;
}
