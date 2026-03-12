import { Component, Input } from '@angular/core'

import { Material } from '@models/material'
import { TranslatePipe } from '@ngx-translate/core'
import { SafePipe } from '../../../pipes/safe.pipe'

@Component({
  selector: 'app-html-preview',
  templateUrl: './html-preview.component.html',
  imports: [TranslatePipe, SafePipe]
})
export class HtmlPreviewComponent {
  @Input() material: Material
}
