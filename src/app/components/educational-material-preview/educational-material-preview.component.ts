import { Component, Input, OnInit } from '@angular/core';

import { Material } from '@models/material';
import { mimeTypes } from '../../constants/mimetypes';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-educational-material-preview',
  templateUrl: './educational-material-preview.component.html',
  styleUrls: ['./educational-material-preview.component.scss']
})
export class EducationalMaterialPreviewComponent implements OnInit {
  @Input() material: Material;
  @Input() isCollection = false;
  lang: string = this.translate.currentLang;

  constructor(
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });
  }

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

    if (mimeTypes.html.includes(mimeType)) {
      return 'html';
    }

    if (mimeTypes.office.includes(mimeType)) {
      return 'office';
    }

    if (mimeTypes.image.includes(mimeType)) {
      return 'image';
    }
  }
}
