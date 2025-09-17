import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core'

import { Material } from '@models/material'
import { environment } from '../../../environments/environment'

@Component({
  selector: 'app-pdf-preview',
  templateUrl: './pdf-preview.component.html'
})
export class PdfPreviewComponent implements OnInit, OnChanges {
  @Input() material: Material
  testid = window.location.href.split('/').reverse()[0]
  materialUrl: string
  @ViewChild('pdfViewer', { static: true }) public pdfViewer

  ngOnInit(): void {
    this.materialUrl = `${environment.backendUrl}/download/${this.material.filekey}`
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.materialUrl = `${environment.backendUrl}/download/${this.material.filekey}`
    this.pdfViewer.pdfSrc = `${environment.backendUrl}/download/${this.material.filekey}`
    this.pdfViewer.refresh()
  }
}
