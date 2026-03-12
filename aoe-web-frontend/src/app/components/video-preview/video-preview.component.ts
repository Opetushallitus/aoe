import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core'

import { Material } from '@models/material'
import { environment } from '../../../environments/environment'
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-video-preview',
    templateUrl: './video-preview.component.html',
    imports: [TranslatePipe]
})
export class VideoPreviewComponent implements OnInit, OnChanges {
  @ViewChild('videoElement', { static: true }) private player: ElementRef
  @Input() material: Material
  materialUrl: string

  ngOnInit(): void {
    this.materialUrl = `${environment.backendUrl}/download/${this.material.filekey}`
  }

  ngOnChanges(_changes: SimpleChanges): void {
    // refreshes video player after source change
    this.player.nativeElement.load()

    this.materialUrl = `${environment.backendUrl}/download/${this.material.filekey}`
  }
}
