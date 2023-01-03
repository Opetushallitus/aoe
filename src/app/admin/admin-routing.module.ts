import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminComponent } from './admin.component';
import { RemoveMaterialComponent } from './remove-material/remove-material.component';
import { AuthGuard } from '../guards';
import { ChangeMaterialOwnerComponent } from './change-material-owner/change-material-owner.component';
import { AdminGuard } from '../guards';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ManageMaterialsComponent } from './manage-materials-view/manage-materials.component';
import { ManageServiceComponent } from './manage-service-view/manage-service.component';
import { NotificationComponent } from './notification/notification.component';
import { AnalyticsViewComponent } from './analytics-view/analytics-view.component';

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
                canActivate: [AuthGuard, AdminGuard],
                runGuardsAndResolvers: 'always',
            },
            {
                path: 'hallinnoi-materiaaleja',
                component: ManageMaterialsComponent,
                canActivate: [AuthGuard, AdminGuard],
                runGuardsAndResolvers: 'always',
            },
            {
                path: 'hallinnoi-palvelua',
                component: ManageServiceComponent,
                canActivate: [AuthGuard, AdminGuard],
                runGuardsAndResolvers: 'always',
            },
            {
                path: 'analytiikka',
                component: AnalyticsViewComponent,
                canActivate: [AuthGuard, AdminGuard],
                runGuardsAndResolvers: 'always',
            },
            {
                path: 'arkistoi-materiaali',
                component: RemoveMaterialComponent,
                canActivate: [AuthGuard, AdminGuard],
                runGuardsAndResolvers: 'always',
            },
            {
                path: 'vaihda-omistaja',
                component: ChangeMaterialOwnerComponent,
                canActivate: [AuthGuard, AdminGuard],
                runGuardsAndResolvers: 'always',
            },
            {
                path: 'huoltoilmoitus',
                component: NotificationComponent,
                canActivate: [AuthGuard, AdminGuard],
                runGuardsAndResolvers: 'always',
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRoutingModule {}
