import { Component } from '@angular/core'
import { ChangeMaterialOwnerComponent } from '../change-material-owner/change-material-owner.component';
import { RemoveMaterialComponent } from '../remove-material/remove-material.component';

@Component({
    selector: 'app-manage-materials',
    templateUrl: './manage-materials.component.html',
    styleUrls: ['./manage-materials.component.scss'],
    imports: [ChangeMaterialOwnerComponent, RemoveMaterialComponent]
})
export class ManageMaterialsComponent {
  constructor() {}
}
