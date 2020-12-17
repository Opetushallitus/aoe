import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { RemoveMaterialComponent } from './remove-material/remove-material.component';
import { AuthGuard } from '../guards/auth.guard';
import { ChangeMaterialOwnerComponent } from './change-material-owner/change-material-owner.component';
import { AdminGuard } from '../guards/admin.guard';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [
    AdminComponent,
    RemoveMaterialComponent,
    ChangeMaterialOwnerComponent,
    DashboardComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    NgSelectModule,
  ],
  providers: [
    AuthGuard,
    AdminGuard,
  ],
})
export class AdminModule { }
