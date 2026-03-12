import { Component, Input } from '@angular/core'

import { Material } from '@models/material'
import { FocusRemoverDirective } from '../../directives/focus-remover.directive';
import { TranslatePipe } from '@ngx-translate/core';
import { SafePipe } from '../../pipes/safe.pipe';

@Component({
    selector: 'app-html-preview',
    templateUrl: './html-preview.component.html',
    imports: [FocusRemoverDirective, TranslatePipe, SafePipe]
})
export class HtmlPreviewComponent {
  @Input() material: Material
}
