import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

import { Material } from '../../models/material';

@Component({
  selector: 'app-audio-preview',
  templateUrl: './audio-preview.component.html',
})
export class AudioPreviewComponent implements OnChanges {
  @ViewChild('audioElement', { static: true }) audioPlayerRef: ElementRef;
  @Input() material: Material;

  ngOnChanges(changes: SimpleChanges): void {
    // refreshes audio player after source change
    this.audioPlayerRef.nativeElement.load();
  }
}
