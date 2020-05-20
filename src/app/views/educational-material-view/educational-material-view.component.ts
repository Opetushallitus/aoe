import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { EducationalMaterial } from '@models/educational-material';
import { Material } from '@models/material';
import { BackendService } from '@services/backend.service';
import { environment } from '../../../environments/environment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
// tslint:disable-next-line:max-line-length
import { EducationalMaterialRatingModalComponent } from '@components/educational-material-rating-modal/educational-material-rating-modal.component';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-demo-material-view',
  templateUrl: './educational-material-view.component.html',
  styleUrls: ['./educational-material-view.component.scss']
})
export class EducationalMaterialViewComponent implements OnInit {
  lang: string = this.translate.currentLang;
  materialId: number;
  educationalMaterial: EducationalMaterial;
  previewMaterial: Material;
  downloadUrl: string;
  embedCode: string;
  embedCodeCopied: boolean;

  materialName: string;
  description: string;
  materials: Material[];
  metadataHeading: string;
  reviewModalRef: BsModalRef;

  constructor(
    private route: ActivatedRoute,
    private backendSvc: BackendService,
    private translate: TranslateService,
    private modalSvc: BsModalService,
    public authSvc: AuthService,
  ) { }

  ngOnInit(): void {
    this.materialId = +this.route.snapshot.paramMap.get('materialId');

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      if (this.educationalMaterial) {
        this.updateMaterialName();
        this.updateDescription();
        this.updateMaterials();
      }
    });

    this.backendSvc.getMaterial(this.materialId).subscribe((data: EducationalMaterial) => {
      this.educationalMaterial = data;
      this.downloadUrl = `${environment.backendUrl}/material/file/${this.materialId}`;
      // tslint:disable-next-line:max-line-length
      this.embedCode = `<iframe src="${environment.frontendUrl}/#/embed/${this.materialId}/${this.lang}" width="720" height="360"></iframe>`;

      this.updateMaterialName();
      this.updateDescription();
      this.updateMaterials();
    });

    this.updateMetadataHeading(false);
  }

  setPreviewMaterial(material: Material): void {
    this.previewMaterial = material;
  }

  updateMaterialName(): void {
    if (this.educationalMaterial.name.find(n => n.language === this.lang).materialname !== '') {
      this.materialName = this.educationalMaterial.name.find(n => n.language === this.lang).materialname;
    } else {
      this.materialName = this.educationalMaterial.name.find(n => n.language === 'fi').materialname;
    }
  }

  updateDescription(): void {
    if (this.educationalMaterial.description.find(d => d.language === this.lang).description !== '') {
      this.description = this.educationalMaterial.description.find(d => d.language === this.lang).description;
    } else {
      this.description = this.educationalMaterial.description.find(d => d.language === 'fi').description;
    }
  }

  updateMaterials(): void {
    if (this.educationalMaterial.materials.filter(m => m.language === this.lang).length > 0) {
      this.materials = this.educationalMaterial.materials.filter(m => m.language === this.lang);
    } else {
      this.materials = this.educationalMaterial.materials.filter(m => m.language === 'fi');
    }

    if (this.materials.length > 0) {
      this.previewMaterial = this.materials[0];
    }
  }

  updateMetadataHeading(event: boolean): void {
    if (event) {
      this.metadataHeading = 'Vähemmän kuvailutietoja';
    } else {
      this.metadataHeading = 'Lisää kuvailutietoja';
    }
  }

  openReviewModal(): void {
    const initialState = {
      materialId: this.materialId,
    };

    this.reviewModalRef = this.modalSvc.show(EducationalMaterialRatingModalComponent, { initialState });
  }
}
