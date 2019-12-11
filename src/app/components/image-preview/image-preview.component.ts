import { Component, Input, OnInit } from '@angular/core';

import { Material } from '../../models/material';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.component.html',
})
export class ImagePreviewComponent implements OnInit {
  @Input() material: Material;
  materialUrl: string;

  ngOnInit(): void {
    this.materialUrl = `${environment.backendUrl}/download/${this.material.filekey}`;
  }
}
