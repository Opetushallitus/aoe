import { Component, Input, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-archived-material',
  templateUrl: './archived-material.component.html',
  styleUrls: ['./archived-material.component.scss']
})
export class ArchivedMaterialComponent implements OnInit {
  @Input() materialId: string;
  lang: string;

  constructor(
    private translate: TranslateService,
    private titleSvc: Title,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.setTitle();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;

      this.setTitle();
    });

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.materialId = params.get('materialId');
    });
  }

  setTitle(): void {
    this.translate.get('titles.archived').subscribe((title: string) => {
      this.titleSvc.setTitle(`${title} ${environment.title}`);
    });
  }
}
