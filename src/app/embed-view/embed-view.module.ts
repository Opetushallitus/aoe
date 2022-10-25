import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { EmbedViewRoutingModule } from './embed-view-routing.module';
//import { MaterialService } from './material.service';

// 3rd party components
import { NgSelectModule } from '@ng-select/ng-select';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';

//pipes
import { SharedModule, HttpLoaderFactory } from '../shared/shared.module';

// components
import { EducationalMaterialEmbedViewComponent } from './educational-material-embed-view.component';
import { EducationalMaterialPreviewComponent } from './preview-materials/educational-material-preview/educational-material-preview.component';
import { ImagePreviewComponent } from './preview-materials/image-preview/image-preview.component';
import { AudioPreviewComponent } from './preview-materials/audio-preview/audio-preview.component';
import { HtmlPreviewComponent } from './preview-materials/html-preview/html-preview.component';
import { OfficePreviewComponent } from './preview-materials/office-preview/office-preview.component';
import { PdfPreviewComponent } from './preview-materials/pdf-preview/pdf-preview.component';
import { VideoPreviewComponent } from './preview-materials/video-preview/video-preview.component';

@NgModule({
    declarations: [
        EducationalMaterialEmbedViewComponent,
        EducationalMaterialPreviewComponent,
        ImagePreviewComponent,
        AudioPreviewComponent,
        HtmlPreviewComponent,
        OfficePreviewComponent,
        PdfPreviewComponent,
        VideoPreviewComponent,
    ],
    imports: [
        CommonModule,
        EmbedViewRoutingModule,
        ReactiveFormsModule,
        NgSelectModule,
        SharedModule,
        PdfJsViewerModule,
    ],
})
export class EmbedViewModule {}
