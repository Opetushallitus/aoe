import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';

import { Material } from '../../models/material';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-audio-preview',
  templateUrl: './audio-preview.component.html',
})
export class AudioPreviewComponent implements OnInit, OnChanges {
  @ViewChild('audioElement', { static: true }) audioPlayerRef: ElementRef;
  @Input() material: Material;
  materialUrl: string;

  ngOnInit(): void {
    this.materialUrl = `${environment.backendUrl}/download/${this.material.filekey}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // refreshes audio player after source change
    this.audioPlayerRef.nativeElement.load();
  }
}
