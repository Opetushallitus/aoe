import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';

import { EmbedService } from './embed.service';
import { environment } from '../../environments/environment';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { getLanguage, setLanguage } from '../shared/shared.module';
import { EducationalMaterial } from '@models/educational-material';
import { Material } from '@models/material';
import { License } from '@models/koodisto/license';
import { Subtitle } from '@models/subtitle';
import { Language } from '@models/koodisto/language';

@Component({
    selector: 'app-educational-material-embed-view',
    templateUrl: './educational-material-embed-view.component.html',
    styleUrls: ['./educational-material-embed-view.component.scss'],
})
export class EducationalMaterialEmbedViewComponent implements OnInit, OnDestroy {
    materialSubscription: Subscription;
    materialId: number;
    lang: string;
    educationalMaterial: EducationalMaterial;
    previewMaterial: Material;
    materials: Material[];
    materialName: string;
    licenses: License[];
    licenseSubscription: Subscription;
    materialLanguages: string[];
    selectedLanguage: string;
    languages: Language[];
    materialUrl: string;

    constructor(
        private route: ActivatedRoute,
        private materialService: EmbedService,
        @Inject(DOCUMENT) document: Document,
        private translate: TranslateService,
        private renderer: Renderer2,
    ) {
        translate.addLangs(['fi', 'en', 'sv']);
        translate.setDefaultLang('fi');

        const lang = getLanguage();

        if (lang === null) {
            const browserLang = translate.getBrowserLang();

            setLanguage(browserLang.match(/fi|en|sv/) ? browserLang : 'fi');
            translate.use(browserLang);
        } else {
            translate.use(lang);
        }

        translate.onLangChange.subscribe((event: LangChangeEvent) => {
            renderer.setAttribute(document.documentElement, 'lang', event.lang);
        });
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            this.materialId = +params.get('materialId');
            this.lang = params.get('lang').toLowerCase();

            this.materialService.updateMaterial(this.materialId);
            this.licenseSubscription = this.materialService.licenses$.subscribe((licenses: License[]) => {
                this.licenses = licenses;
            });
            this.materialService.updateLicenses();
        });

        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            this.lang = event.lang;

            if (this.educationalMaterial) {
                this.updateMaterialName();
            }

            if (this.materialLanguages?.includes(event.lang.toLowerCase())) {
                this.setSelectedLanguage(event.lang.toLowerCase());
            }
        });

        this.materialSubscription = this.materialService.material$.subscribe((material: EducationalMaterial) => {
            this.educationalMaterial = material;

            // set materials
            this.materials = material.materials;
            // set material languages
            const materialLanguages: string[] = [];
            this.materials.forEach((m: Material) => {
                materialLanguages.push(m.language.toLowerCase());

                m.subtitles.forEach((subtitle: Subtitle) => {
                    materialLanguages.push(subtitle.srclang.toLowerCase());
                });
            });
            this.materialLanguages = [...new Set(materialLanguages)];

            // set default language (1. UI lang, 2. FI, 3. first language in array)
            this.selectedLanguage = this.materialLanguages.find((lang: string) => lang === this.lang)
                ? this.materialLanguages.find((lang: string) => lang === this.lang)
                : this.materialLanguages.find((lang: string) => lang === 'fi')
                ? this.materialLanguages.find((lang: string) => lang === 'fi')
                : this.materialLanguages[0];

            // set preview material
            this.setPreviewMaterial(
                this.materials.find((m: Material) => {
                    if (
                        m.language === this.selectedLanguage ||
                        m.subtitles.find((subtitle: Subtitle) => subtitle.srclang === this.selectedLanguage)
                    ) {
                        return m;
                    }
                }),
            );

            if (this.materials.length > 0) {
                this.previewMaterial = this.materials[0];
            }

            this.updateMaterialName();
        });
        this.materialUrl = `${environment.frontendUrl}/#/materiaali/${this.materialId}`;
    }

    /**
     * Sets selected language to preview language. Updates preview material to match selected language.
     * @param language {string}
     */
    setSelectedLanguage(language: string): void {
        // set language
        this.selectedLanguage = language;

        // set preview material
        this.setPreviewMaterial(
            this.materials.find((material: Material) => {
                if (
                    material.language === language ||
                    material.subtitles.find((subtitle: Subtitle) => subtitle.srclang === language)
                ) {
                    return material;
                }
            }),
        );
    }

    updateMaterialName(): void {
        if (this.educationalMaterial.name.find((n) => n.language === this.lang).materialname !== '') {
            this.materialName = this.educationalMaterial.name.find((n) => n.language === this.lang).materialname;
        } else {
            this.materialName = this.educationalMaterial.name.find((n) => n.language === 'fi').materialname;
        }
    }

    getLicense(key: string): License {
        return this.licenses?.find((license: License) => license.key === key);
    }

    ngOnDestroy(): void {
        this.materialSubscription.unsubscribe();
    }

    getLanguageValue(lang: string): string {
        return this.languages?.find((language: Language) => language.key === lang)?.value;
    }

    setPreviewMaterial(material: Material): void {
        this.previewMaterial = material;
    }
}
