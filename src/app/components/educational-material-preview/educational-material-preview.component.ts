import { Component, Input } from '@angular/core';

import { Material } from '../../models/material';
import { mimeTypes } from '../../constants/mimetypes';

@Component({
  selector: 'app-educational-material-preview',
  templateUrl: './educational-material-preview.component.html',
})
export class EducationalMaterialPreviewComponent {
  @Input() material: Material;

  public checkMimeType(mimeType: string) {
    if (mimeTypes.video.includes(mimeType)) {
      return 'video';
    }

    if (mimeTypes.audio.includes(mimeType)) {
      return 'audio';
    }

    if (mimeTypes.pdf.includes(mimeType)) {
      return 'pdf';
    }

    if (mimeTypes.office.includes(mimeType)) {
      return 'office';
    }

    if (mimeTypes.image.includes(mimeType)) {
      return 'image';
    }
  }
}
