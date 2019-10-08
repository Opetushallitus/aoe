import { Component, Input } from '@angular/core';

import { Material } from '../../models/material';

@Component({
  selector: 'app-educational-material-preview',
  templateUrl: './educational-material-preview.component.html',
})
export class EducationalMaterialPreviewComponent {
  @Input() material: Material;

  public checkMimeType(mimeType: string) {
    const imageMimeTypes = [
      'image/jpeg',
      'image/png',
    ];

    if (imageMimeTypes.includes(mimeType)) {
      return 'image';
    }
  }
}
