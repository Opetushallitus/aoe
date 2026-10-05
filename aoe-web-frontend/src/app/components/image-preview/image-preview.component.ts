import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core'

import { Material } from '@models/material'
import { urls } from '@constants/urls'

@Component({
  selector: 'app-image-preview',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './image-preview.component.html'
})
export class ImagePreviewComponent implements OnInit, OnChanges {
  @Input() material: Material
  materialUrl: string

  ngOnInit(): void {
    this.materialUrl = `${urls.backendUrl}/download/${this.material.filekey}`
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.materialUrl = `${urls.backendUrl}/download/${this.material.filekey}`
  }
}
