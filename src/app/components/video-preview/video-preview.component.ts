import { Component, Input } from '@angular/core';

import { Material } from '../../models/demo/material';

@Component({
  selector: 'app-video-preview',
  templateUrl: './video-preview.component.html',
})
export class VideoPreviewComponent {
  @Input() material: Material;
}
