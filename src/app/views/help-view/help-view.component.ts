import { Component } from '@angular/core';

import { FAQGeneral } from '../../mocks/demo/faq.general.mock';
import { FAQMaterial } from '../../mocks/demo/faq.material.mock';
import { FAQOrganisation } from '../../mocks/demo/faq.organisation.mock';

@Component({
  selector: 'app-help-view',
  templateUrl: './help-view.component.html',
})
export class HelpViewComponent {
  faqGeneral = FAQGeneral;
  faqMaterial = FAQMaterial;
  faqOrganisation = FAQOrganisation;
}
