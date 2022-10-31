import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Material } from '@models/material';
import { environment } from '../../../../environments/environment';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-office-preview',
    templateUrl: './office-preview.component.html',
})
export class OfficePreviewComponent implements OnInit, OnChanges {
    @Input() material: Material;
    lang: string = this.translate.currentLang;
    filepath: string;
    materialUrl: string;
    downloadUrl: string;
    @ViewChild('officeViewer', { static: true }) public pdfViewer;

    constructor(private translate: TranslateService) {}

    ngOnInit(): void {
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            this.lang = event.lang;
        });

        this.filepath = this.material.filepath.slice(27);
        this.materialUrl = `${environment.embedBackendUrl}/` + this.filepath;
        this.downloadUrl = `${environment.embedBackendUrl}/download/${this.material.filekey}`;
    }

    ngOnChanges(_changes: SimpleChanges): void {
        this.filepath = this.material.filepath.slice(27);
        this.materialUrl = `${environment.embedBackendUrl}/` + this.filepath;
        this.downloadUrl = `${environment.embedBackendUrl}/download/${this.material.filekey}`;
        this.pdfViewer.pdfSrc = this.material.filepath;
        this.pdfViewer.refresh();
    }
}
