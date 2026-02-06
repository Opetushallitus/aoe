import { Component, Input } from '@angular/core'

import { Material } from '@models/material'

@Component({
    selector: 'app-html-preview',
    templateUrl: './html-preview.component.html',
    standalone: false
})
export class HtmlPreviewComponent {
  @Input() material: Material
}
