import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Material } from '@models/material';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BackendService } from '@services/backend.service';

@Component({
  selector: 'app-collection-material-preview',
  templateUrl: './collection-material-preview.component.html',
  styleUrls: ['./collection-material-preview.component.scss']
})
export class CollectionMaterialPreviewComponent implements OnInit {
  resourceId: string;
  lang: string = this.translate.currentLang;
  isLoading = true;
  materials: Material[];
  languages: string[];
  selectedLanguage: string;
  previewMaterial: any;

  constructor(
    private route: ActivatedRoute,
    private translate: TranslateService,
    private backendSvc: BackendService,
  ) { }

  ngOnInit(): void {
    this.resourceId = this.route.snapshot.paramMap.get('resourceId');

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      if (this.languages && this.languages.includes(event.lang.toLowerCase())) {
        this.setSelectedLanguage(event.lang.toLowerCase());
      }
    });

    this.backendSvc.getCollectionMaterials(this.resourceId).subscribe((materials: Material[]) => {
      this.isLoading = false;
      this.materials = materials;
      this.languages = [...new Set(materials.map((material: Material) => material.language.toLowerCase()))];

      this.selectedLanguage = this.languages.find((lang: string) => lang === this.lang)
        ? this.languages.find((lang: string) => lang === this.lang)
        : this.languages.find((lang: string) => lang === 'fi')
          ? this.languages.find((lang: string) => lang === 'fi')
          : this.languages[0];

      this.setPreviewMaterial(materials.find((material: Material) => material.language === this.selectedLanguage));
    });
  }

  /**
   * Sets selected language to preview language. Updates preview material to match selected language.
   * @param {string} lang
   */
  setSelectedLanguage(lang: string): void {
    this.selectedLanguage = lang;
    this.setPreviewMaterial(this.materials.find((material: Material) => material.language === lang));
  }

  /**
   * Sets preview material.
   * @param {Material} material
   */
  setPreviewMaterial(material: Material): void {
    this.previewMaterial = material;
  }
}
