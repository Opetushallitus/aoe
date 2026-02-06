import { Component, Input, OnInit } from '@angular/core'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'
import { Title } from '@angular/platform-browser'
import { ActivatedRoute, ParamMap } from '@angular/router'

@Component({
  selector: 'app-archived-material',
  templateUrl: './archived-material.component.html',
  styleUrls: ['./archived-material.component.scss'],
  standalone: false
})
export class ArchivedMaterialComponent implements OnInit {
  @Input() materialId: string
  lang: string

  constructor(
    private translate: TranslateService,
    private titleService: Title,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.setTitle()

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang

      this.setTitle()
    })

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.materialId = params.get('materialId')
    })
  }

  setTitle(): void {
    this.translate
      .get(['common.serviceName', 'titles.archived'])
      .subscribe((translations: { [key: string]: string }) => {
        this.titleService.setTitle(
          `${translations['titles.archived']} - ${translations['common.serviceName']}`
        )
      })
  }
}
