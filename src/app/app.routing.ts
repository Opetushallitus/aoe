import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import Containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { LoginComponent } from './views/login/login.component';
import { AddMaterialComponent } from './views/add-material/add-material.component';
import { EducationalMaterialViewComponent } from './views/educational-material-view/educational-material-view.component';
import { HelpViewComponent } from './views/help-view/help-view.component';
import { TermsOfUseViewComponent } from './views/terms-of-use-view/terms-of-use-view.component';
import { PrivacyPolicyViewComponent } from './views/privacy-policy-view/privacy-policy-view.component';
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
        loadChildren: './views/mainView/main-view.module#MainViewModule'
      },
      {
        path: 'lisaa-materiaaleja',
        component: AddMaterialComponent
      },
      {
        path: 'demo/materiaali/:id/:slug',
        component: EducationalMaterialViewComponent
      },
      {
        path: 'ohje',
        component: HelpViewComponent
      },
      {
        path: 'kayttoehdot',
        component: TermsOfUseViewComponent
      },
      {
        path: 'rekisteriseloste',
        component: PrivacyPolicyViewComponent
      },
      {
        path: 'saavutettavuusseloste',
        component: AccessibilityPolicyViewComponent
      }
    ]
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
