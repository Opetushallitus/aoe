import { Component, Input } from '@angular/core';

import { Material } from '../../models/demo/material';

@Component({
  selector: 'app-audio-preview',
  templateUrl: './audio-preview.component.html',
})
export class AudioPreviewComponent {
  @Input() material: Material;
}
