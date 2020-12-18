import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminComponent } from './admin.component';
import { RemoveMaterialComponent } from './remove-material/remove-material.component';
import { AuthGuard } from '../guards/auth.guard';
import { ChangeMaterialOwnerComponent } from './change-material-owner/change-material-owner.component';
import { AdminGuard } from '../guards/admin.guard';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'etusivu',
    pathMatch: 'full',
  },
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'etusivu',
        component: DashboardComponent,
        canActivate: [
          AuthGuard,
          AdminGuard,
        ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'arkistoi-materiaali',
        component: RemoveMaterialComponent,
        canActivate: [
          AuthGuard,
          AdminGuard,
        ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'vaihda-omistajaa',
        component: ChangeMaterialOwnerComponent,
        canActivate: [
          AuthGuard,
          AdminGuard,
        ],
        runGuardsAndResolvers: 'always',
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class AdminRoutingModule { }
