import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BackendService } from '@services/backend.service';
import { EducationalMaterialList } from '@models/educational-material-list';

@Component({
  templateUrl: 'main-view.component.html'
})
export class MainViewComponent implements OnInit {
  lang: string = this.translate.currentLang;
  recentMaterials: EducationalMaterialList[];

  constructor(
    private translate: TranslateService,
    private backendSvc: BackendService,
  ) { }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.backendSvc.getRecentMaterialList().subscribe(data => {
      this.recentMaterials = data;
    });
  }
}
