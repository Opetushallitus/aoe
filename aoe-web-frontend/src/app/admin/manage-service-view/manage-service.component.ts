import { Component, ChangeDetectionStrategy } from '@angular/core'
import { NotificationComponent } from '../notification/notification.component'

@Component({
  selector: 'app-manage-service',
  templateUrl: './manage-service.component.html',
  styleUrls: ['./manage-service.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NotificationComponent]
})
export class ManageServiceComponent {
  constructor() {}
}
