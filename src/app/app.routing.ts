import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import Containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { LoginComponent } from './views/login/login.component';
import { EducationalMaterialViewComponent } from './views/educational-material-view/educational-material-view.component';
import { InfoViewComponent } from './views/info-view/info-view.component';
import { AccessibilityPolicyViewComponent } from './views/accessibility-policy-view/accessibility-policy-view.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'etusivu',
    pathMatch: 'full',
  },
  {
    path: '404',
    component: P404Component,
    data: {
      title: 'Page 404'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login Page'
    }
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'etusivu',
        loadChildren: () => import('./views/mainView/main-view.module').then(m => m.MainViewModule),
      },
      {
        path: 'demo/materiaali/:specialId/:slug',
        component: EducationalMaterialViewComponent,
      },
      {
        path: 'lisatietoa',
        component: InfoViewComponent,
      },
      {
        path: 'saavutettavuusseloste',
        component: AccessibilityPolicyViewComponent,
      }
    ],
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
