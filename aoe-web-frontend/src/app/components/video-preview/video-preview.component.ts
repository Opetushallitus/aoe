import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core'

import { Material } from '@models/material'
import { urls } from '@constants/urls'
import { TranslatePipe } from '@ngx-translate/core'

@Component({
  selector: 'app-video-preview',
  templateUrl: './video-preview.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TranslatePipe]
})
export class VideoPreviewComponent implements OnInit, OnChanges {
  @ViewChild('videoElement', { static: true }) private player: ElementRef
  @Input() material: Material
  materialUrl: string

  ngOnInit(): void {
    this.materialUrl = `${urls.backendUrl}/download/${this.material.filekey}`
  }

  ngOnChanges(_changes: SimpleChanges): void {
    // refreshes video player after source change
    this.player.nativeElement.load()

    this.materialUrl = `${urls.backendUrl}/download/${this.material.filekey}`
  }
}
