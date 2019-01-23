import { Component, Input } from '@angular/core';
import { DemoMaterial } from '../../models/demo-material';

@Component({
  selector: 'app-oppimateriaali-card',
  templateUrl: './oppimateriaali-card.component.html'
})
export class OppimateriaaliCardComponent {
  @Input() demoMaterial: DemoMaterial;
}
