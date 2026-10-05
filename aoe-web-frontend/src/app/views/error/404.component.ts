import { Component, ChangeDetectionStrategy } from '@angular/core'
import { FocusRemoverDirective } from '../../directives/focus-remover.directive'

@Component({
  templateUrl: '404.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FocusRemoverDirective]
})
export class P404Component {
  constructor() {}
}
