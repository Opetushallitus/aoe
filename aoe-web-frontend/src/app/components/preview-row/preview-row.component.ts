import { Component, Input } from '@angular/core'

@Component({
    selector: 'app-preview-row',
    templateUrl: './preview-row.component.html',
    styleUrls: ['./preview-row.component.scss'],
    standalone: false
})
export class PreviewRowComponent {
  @Input() title: string
  @Input() items?: any[]
  @Input() item?: string
  @Input() property?: string
  @Input() required?: boolean
  @Input() routerLinkOptions?: any[]

  constructor() {}
}
