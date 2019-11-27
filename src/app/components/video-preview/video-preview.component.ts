import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

import { Material } from '../../models/material';

@Component({
  selector: 'app-video-preview',
  templateUrl: './video-preview.component.html',
})
export class VideoPreviewComponent implements OnChanges {
  @ViewChild('videoElement', { static: true }) private player: ElementRef;
  @Input() material: Material;

  ngOnChanges(changes: SimpleChanges): void {
    // refreshes video player after source change
    this.player.nativeElement.load();
  }
}
