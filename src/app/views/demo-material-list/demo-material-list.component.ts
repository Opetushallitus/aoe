import { Component } from '@angular/core';

import { DEMOMATERIALS } from './mock-demo-materials';

@Component({
  selector: 'app-demo-material-list',
  templateUrl: './demo-material-list.component.html',
})
export class DemoMaterialListComponent {
  demoMaterials = DEMOMATERIALS;
}
