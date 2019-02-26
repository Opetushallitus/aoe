import { Component, Input } from '@angular/core';

import { Material } from '../../models/demo/material';

@Component({
  selector: 'app-office-preview',
  templateUrl: './office-preview.component.html',
})
export class OfficePreviewComponent {
  @Input() material: Material;
}
