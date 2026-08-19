import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'

import { Material } from '@models/material'
import { urls } from '@constants/urls'

@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.component.html'
})
export class ImagePreviewComponent implements OnInit, OnChanges {
  @Input() material: Material
  materialUrl: string

  ngOnInit(): void {
    this.materialUrl = `${urls.embedBackendUrl}/download/${this.material.filekey}`
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.materialUrl = `${urls.embedBackendUrl}/download/${this.material.filekey}`
  }
}
