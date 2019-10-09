import { Component, Input } from '@angular/core';

import { Material } from '../../models/material';

@Component({
  selector: 'app-educational-material-preview',
  templateUrl: './educational-material-preview.component.html',
})
export class EducationalMaterialPreviewComponent {
  @Input() material: Material;

  public checkMimeType(mimeType: string) {
    const videoMIMETypes = [
      'application/x-troff-msvideo',
      'video/avi',
      'video/msvideo',
      'video/x-msvideo',
      'video/mp4',
    ];

    const audioMIMETypes = [
      'audio/mp3',
      'audio/mpeg',
    ];

    const pdfMIMETypes = [
      'application/pdf',
    ];

    const officeMIMETypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.oasis.opendocument.presentation',
      'application/rtf',
    ];

    const imageMIMETypes = [
      'image/bmp',
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/svg+xml',
      'image/tiff',
      'image/webp',
    ];

    if (videoMIMETypes.includes(mimeType)) {
      return 'video';
    }

    if (audioMIMETypes.includes(mimeType)) {
      return 'audio';
    }

    if (pdfMIMETypes.includes(mimeType)) {
      return 'pdf';
    }

    if (officeMIMETypes.includes(mimeType)) {
      return 'office';
    }

    if (imageMIMETypes.includes(mimeType)) {
      return 'image';
    }
  }
}
