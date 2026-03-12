import { Component } from '@angular/core'
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    imports: [RouterLink]
})
export class DashboardComponent {
  constructor() {}
}
