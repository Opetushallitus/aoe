import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'

import { Material } from '@models/material'
import { environment } from '../../../environments/environment'

@Component({
    selector: 'app-image-preview',
    templateUrl: './image-preview.component.html',
    standalone: false
})
export class ImagePreviewComponent implements OnInit, OnChanges {
  @Input() material: Material
  materialUrl: string

  ngOnInit(): void {
    this.materialUrl = `${environment.backendUrl}/download/${this.material.filekey}`
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.materialUrl = `${environment.backendUrl}/download/${this.material.filekey}`
  }
}
