import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BackendService } from '@services/backend.service';
import { EducationalMaterialCard } from '@models/educational-material-card';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Component({
  templateUrl: 'main-view.component.html'
})
export class MainViewComponent implements OnInit {
  lang: string = this.translate.currentLang;
  recentMaterials: EducationalMaterialCard[];

  constructor(
    private translate: TranslateService,
    private backendSvc: BackendService,
    private titleSvc: Title,
  ) { }

  ngOnInit(): void {
    this.setTitle();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.setTitle();
    });

    this.backendSvc.getRecentMaterialList().subscribe(data => {
      this.recentMaterials = data;
    });
  }

  setTitle(): void {
    this.translate.get('titles.home').subscribe((title: string) => {
      this.titleSvc.setTitle(`${title} ${environment.title}`);
    });
  }
}
