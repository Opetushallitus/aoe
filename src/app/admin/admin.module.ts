import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';

// 3rd party components
import { NgSelectModule } from '@ng-select/ng-select';

// components
import { AdminComponent } from './admin.component';
import { RemoveMaterialComponent } from './remove-material/remove-material.component';
import { ChangeMaterialOwnerComponent } from './change-material-owner/change-material-owner.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ManageMaterialsComponent } from './manage-materials-view/manage-materials.component';
import { NotificationComponent } from './notification/notification.component';
import { ManageServiceComponent } from './manage-service-view/manage-service.component';
// guards
import { AdminGuard } from '../guards';
import { AuthGuard } from '../guards';

@NgModule({
  declarations: [
    AdminComponent,
    RemoveMaterialComponent,
    ChangeMaterialOwnerComponent,
    DashboardComponent,
    ManageMaterialsComponent,
    NotificationComponent,
    ManageServiceComponent,
  ],
  imports: [CommonModule, AdminRoutingModule, ReactiveFormsModule, NgSelectModule],
  providers: [AuthGuard, AdminGuard],
})
export class AdminModule {}
