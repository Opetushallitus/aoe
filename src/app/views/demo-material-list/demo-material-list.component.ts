import { Component } from '@angular/core';

import { DEMOMATERIALS } from '../../mocks/demo-materials.mock';

@Component({
  selector: 'app-demo-material-list',
  templateUrl: './demo-material-list.component.html',
})
export class DemoMaterialListComponent {
  demoMaterials = DEMOMATERIALS;
}
