import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Material } from '@models/material';

@Component({
  selector: 'app-office-preview',
  templateUrl: './office-preview.component.html',
})
export class OfficePreviewComponent implements OnInit, OnChanges {
  @Input() material: Material;
  materialUrl: string;
  @ViewChild('officeViewer', { static: true }) public pdfViewer;

  ngOnInit(): void {
    this.materialUrl = this.material.filepath;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.materialUrl = this.material.filepath;
    this.pdfViewer.pdfSrc = this.material.filepath;
    this.pdfViewer.refresh();
  }
}
