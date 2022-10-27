import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { EducationalMaterial } from '@models/educational-material';
import { Material } from '@models/material';
import { MaterialService } from '@services/material.service';
import { environment } from '../../../environments/environment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
// eslint-disable-next-line max-len
import { EducationalMaterialRatingModalComponent } from '@components/educational-material-rating-modal/educational-material-rating-modal.component';
import { AuthService } from '@services/auth.service';
import { AddToCollectionModalComponent } from '@components/add-to-collection-modal/add-to-collection-modal.component';
import { Title } from '@angular/platform-browser';
import { Subtitle } from '@models/subtitle';
import { Subscription } from 'rxjs';
import { SocialMetadataModalComponent } from '@components/social-metadata-modal/social-metadata-modal.component';
import { SocialMetadata } from '@models/social-metadata/social-metadata';
import { SocialMetadataService } from '@services/social-metadata.service';
import { Language } from '@models/koodisto/language';
import { KoodistoService } from '@services/koodisto.service';
import { License } from '@models/koodisto/license';

@Component({
    selector: 'app-demo-material-view',
    templateUrl: './educational-material-view.component.html',
    styleUrls: ['./educational-material-view.component.scss'],
})
export class EducationalMaterialViewComponent implements OnInit, OnDestroy {
    lang: string = this.translate.currentLang;
    materialId: number;
    materialVersionDate: string;
    educationalMaterialSubscription: Subscription;
    educationalMaterial: EducationalMaterial;
    materialIsLoading = true;
    materialIsArchived = false;
    previewMaterial: Material;
    downloadUrl: string;
    nullDownloadUrl: string;
    embedCode: string;
    embedCodeCopied: boolean;
    materialName: string;
    description: string;
    materials: Material[];
    detailsExpanded = false;
    reviewModalRef: BsModalRef;
    collectionModalRef: BsModalRef;
    socialMetadataModalRef: BsModalRef;
    materialLanguages: string[];
    selectedLanguage: string;
    expired = false;
    expires: string;
    socialMetadataSubscription: Subscription;
    socialMetadata: SocialMetadata;
    languageSubscription: Subscription;
    languages: Language[];
    previewMaterialDomain: string;
    licenses: License[];
    licenseSubscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private materialSvc: MaterialService,
        private translate: TranslateService,
        private modalSvc: BsModalService,
        public authSvc: AuthService,
        private titleSvc: Title,
        private socialMetadataSvc: SocialMetadataService,
        private koodistoService: KoodistoService,
    ) {}

    ngOnInit(): void {
        this.nullDownloadUrl = 'download/null';
        this.route.paramMap.subscribe((params: ParamMap) => {
            this.materialId = +params.get('materialId');
            this.materialVersionDate = params.get('versionDate');

            this.downloadUrl = this.materialVersionDate
                ? `${environment.backendUrl}/material/file/${this.materialId}/${this.materialVersionDate}`
                : `${environment.backendUrl}/material/file/${this.materialId}`;

            this.materialIsLoading = true;
            this.materialSvc.updateMaterial(this.materialId, this.materialVersionDate);
        });

        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            this.lang = event.lang;

            if (this.educationalMaterial) {
                this.updateMaterialName();
                this.updateDescription();
            }

            if (this.materialLanguages?.includes(event.lang.toLowerCase())) {
                this.setSelectedLanguage(event.lang.toLowerCase());
            }

            this.koodistoService.updateLicenses();
        });

        this.languageSubscription = this.koodistoService.languages$.subscribe((languages: Language[]) => {
            this.languages = languages;
        });
        this.koodistoService.updateLanguages();

        this.educationalMaterialSubscription = this.materialSvc.material$.subscribe((material: EducationalMaterial) => {
            this.educationalMaterial = material;
            this.materialIsLoading = false;

            if (JSON.stringify(material) === '{}') {
                this.materialIsArchived = true;
            } else {
                this.materialIsArchived = false;

                // this.downloadUrl = `${environment.backendUrl}/material/file/${this.materialId}`;
                // eslint-disable-next-line max-len
                this.embedCode = `<iframe src="${environment.frontendUrl}/#/embed/${this.materialId}/${this.lang}" width="720" height="360"></iframe>`;

                this.updateMaterialName();
                this.updateDescription();

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

                // if material expired
                if (material.expires) {
                    this.expired = new Date(material.expires) < new Date();
                }
            }
        });

        this.socialMetadataSubscription = this.socialMetadataSvc.socialMetadata$.subscribe(
            (metadata: SocialMetadata) => {
                this.socialMetadata = metadata;
            },
        );
        this.socialMetadataSvc.updateSocialMetadata(this.materialId);

        this.licenseSubscription = this.koodistoService.licenses$.subscribe((licenses: License[]) => {
            this.licenses = licenses;
        });
        this.koodistoService.updateLicenses();
    }

    ngOnDestroy(): void {
        this.educationalMaterialSubscription.unsubscribe();
        this.socialMetadataSubscription.unsubscribe();
        this.languageSubscription.unsubscribe();
        this.licenseSubscription.unsubscribe();
    }

    setTitle(): void {
        if (this.materialVersionDate) {
            this.titleSvc.setTitle(`${this.materialName} (${this.materialVersionDate}) ${environment.title}`);
        } else {
            this.titleSvc.setTitle(`${this.materialName} ${environment.title}`);
        }
    }

    getLanguageValue(lang: string): string {
        return this.languages?.find((language: Language) => language.key === lang)?.value;
    }

    setPreviewMaterial(material: Material): void {
        this.previewMaterial = material;

        if (material.link) {
            this.previewMaterialDomain = new URL(material.link).hostname.replace('www.', '');
        }
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

        this.setTitle();
    }

    updateDescription(): void {
        if (this.educationalMaterial.description.find((d) => d.language === this.lang).description !== '') {
            this.description = this.educationalMaterial.description.find((d) => d.language === this.lang).description;
        } else {
            this.description = this.educationalMaterial.description.find((d) => d.language === 'fi').description;
        }
    }

    openReviewModal(): void {
        const initialState = {
            materialId: this.materialId,
        };

        this.reviewModalRef = this.modalSvc.show(EducationalMaterialRatingModalComponent, { initialState });
    }

    openCollectionModal(): void {
        const initialState = {
            materialId: this.materialId,
        };

        this.collectionModalRef = this.modalSvc.show(AddToCollectionModalComponent, { initialState });
    }

    openSocialMetadataModal(): void {
        const initialState = {
            materialId: this.materialId,
        };

        this.socialMetadataModalRef = this.modalSvc.show(SocialMetadataModalComponent, { initialState });
    }

    getLicense(key: string): License {
        return this.licenses?.find((license: License) => license.key === key);
    }
}
