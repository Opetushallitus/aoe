import { Component, Input, ChangeDetectionStrategy } from '@angular/core'

import { Material } from '@models/material'
import { TranslatePipe } from '@ngx-translate/core'
import { SafePipe } from '../../../pipes/safe.pipe'

@Component({
  selector: 'app-html-preview',
  templateUrl: './html-preview.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TranslatePipe, SafePipe]
})
export class HtmlPreviewComponent {
  @Input() material: Material
}
