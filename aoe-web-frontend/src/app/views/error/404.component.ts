import { Component } from '@angular/core'
import { FocusRemoverDirective } from '../../directives/focus-remover.directive';

@Component({
    templateUrl: '404.component.html',
    imports: [FocusRemoverDirective]
})
export class P404Component {
  constructor() {}
}
