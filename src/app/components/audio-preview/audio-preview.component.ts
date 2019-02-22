import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

import { Material } from '../../models/demo/material';

@Component({
  selector: 'app-audio-preview',
  templateUrl: './audio-preview.component.html',
})
export class AudioPreviewComponent implements OnChanges {
  @ViewChild('audioElement') audioPlayerRef: ElementRef;
  @Input() set material(material: Material) {
    this._material = material;
  }
  public _material: Material;

  ngOnChanges(changes: SimpleChanges): void {
    // refreshes audio player after source change
    this.audioPlayerRef.nativeElement.load();
  }
}
