import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pdf-reader-view',
  templateUrl: './pdf-reader-view.component.html',
  styleUrls: ['./pdf-reader-view.component.scss']
})
export class PdfReaderViewComponent implements OnInit {
  filekey: string;
  pdfUrl: string;

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.filekey = this.route.snapshot.paramMap.get('filekey');
    this.pdfUrl = `${environment.backendUrl}/download/${this.filekey}`;
  }
}
