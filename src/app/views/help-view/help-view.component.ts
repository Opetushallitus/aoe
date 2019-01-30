import { Component } from '@angular/core';

import { FAQ } from '../../mocks/faq.mock';

@Component({
  selector: 'app-help-view',
  templateUrl: './help-view.component.html',
})
export class HelpViewComponent {
  faq = FAQ;
}
