import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import Containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { EducationalMaterialViewComponent } from './views/educational-material-view/educational-material-view.component';
import { EducationalResourceFormComponent } from './views/educational-resource-form/educational-resource-form.component';
import { HelpViewComponent } from './views/help-view/help-view.component';
import { TermsOfUseViewComponent } from './views/terms-of-use-view/terms-of-use-view.component';
import { PrivacyPolicyViewComponent } from './views/privacy-policy-view/privacy-policy-view.component';

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
      title: 'Page 404',
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
        path: 'materiaali/:specialId/:slug',
        component: EducationalMaterialViewComponent,
      },
      {
        path: 'lisatietoa',
        component: HelpViewComponent,
      },
      {
        path: 'lisaa-oppimateriaali',
        component: EducationalResourceFormComponent,
      },
      {
        path: 'lisaa-oppimateriaali/:tabId',
        component: EducationalResourceFormComponent,
      },
      {
        path: 'kayttoehdot',
        component: TermsOfUseViewComponent,
      },
      {
        path: 'tietosuojaseloste',
        component: PrivacyPolicyViewComponent,
      },
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
