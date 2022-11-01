import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { MaterialService } from '@services/material.service';
import { EducationalMaterialCard } from '@models/educational-material-card';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { KoodistoService } from '@services/koodisto.service';

@Component({
    templateUrl: 'main-view.component.html',
})
export class MainViewComponent implements OnInit {
    lang: string = this.translate.currentLang;
    recentMaterials: EducationalMaterialCard[];

    constructor(
        private koodistoService: KoodistoService,
        private translate: TranslateService,
        private materialService: MaterialService,
        private title: Title,
    ) {}

    ngOnInit(): void {
        this.setTitle();
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            // Update available service languages and save them to the state management (languages$).
            // For the direct URL navigation, update available languages once for each routed parent component.
            this.koodistoService.updateLanguages();
            this.lang = event.lang;
            this.setTitle();
        });
        this.materialService.getRecentMaterialList().subscribe((data) => {
            this.recentMaterials = data;
        });
    }

    setTitle(): void {
        this.translate.get('titles.home').subscribe((title: string) => {
            this.title.setTitle(`${title} ${environment.title}`);
        });
    }
}
