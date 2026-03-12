import { Component } from '@angular/core'
import { NotificationComponent } from '../notification/notification.component';

@Component({
    selector: 'app-manage-service',
    templateUrl: './manage-service.component.html',
    styleUrls: ['./manage-service.component.scss'],
    imports: [NotificationComponent]
})
export class ManageServiceComponent {
  constructor() {}
}
