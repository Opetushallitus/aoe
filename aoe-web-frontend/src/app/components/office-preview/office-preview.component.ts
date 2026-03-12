import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core'
import { Material } from '@models/material'
import { environment } from '../../../environments/environment'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'
import { FocusRemoverDirective } from '../../directives/focus-remover.directive'
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer'

@Component({
  selector: 'app-office-preview',
  templateUrl: './office-preview.component.html',
  imports: [FocusRemoverDirective, PdfJsViewerModule]
})
export class OfficePreviewComponent implements OnInit, OnChanges {
  @Input() material: Material
  lang: string = this.translate.getCurrentLang()
  materialUrl: string
  downloadUrl: string
  @ViewChild('officeViewer', { static: true }) public pdfViewer

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang
    })

    this.materialUrl = this.material.filepath
    this.downloadUrl = `${environment.backendUrl}/download/${this.material.filekey}`
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.materialUrl = this.material.filepath
    this.downloadUrl = `${environment.backendUrl}/download/${this.material.filekey}`
    this.pdfViewer.pdfSrc = this.material.filepath
    this.pdfViewer.refresh()
  }
}
