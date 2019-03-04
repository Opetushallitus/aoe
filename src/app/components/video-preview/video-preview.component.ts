import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

import { Material } from '../../models/demo/material';

@Component({
  selector: 'app-video-preview',
  templateUrl: './video-preview.component.html',
})
export class VideoPreviewComponent implements OnChanges {
  @ViewChild('videoElement') private player: ElementRef;
  @Input() set material(material: Material) {
    this._material = material;
  }
  public _material: Material;

  ngOnChanges(changes: SimpleChanges): void {
    // refreshes video player after source change
    this.player.nativeElement.load();
  }
}
