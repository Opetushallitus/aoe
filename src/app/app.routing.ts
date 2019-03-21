import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import Containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { LoginComponent } from './views/login/login.component';
import { EducationalMaterialViewComponent } from './views/educational-material-view/educational-material-view.component';
import { InfoViewComponent } from './views/info-view/info-view.component';
import { KoodistoTestiComponent } from './views/koodisto-testi/koodisto-testi.component';
import { BasicDetailsComponent } from './views/add-educational-resource-form/basic-details/basic-details.component';
import { EducationalDetailsComponent } from './views/add-educational-resource-form/educational-details/educational-details.component';
import { ExtendedDetailsComponent } from './views/add-educational-resource-form/extended-details/extended-details.component';
import { LicenseDetailsComponent } from './views/add-educational-resource-form/license-details/license-details.component';
import { BasedOnDetailsComponent } from './views/add-educational-resource-form/based-on-details/based-on-details.component';

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
        path: 'materiaali/:specialId/:slug',
        component: EducationalMaterialViewComponent
      },
      {
        path: 'lisatietoa',
        component: InfoViewComponent,
      },
      {
        path: 'koodisto-testi',
        component: KoodistoTestiComponent,
      },
      {
        path: 'lisaa-oppimateriaali',
        children: [
          {
            path: '',
            redirectTo: 'perustiedot',
            pathMatch: 'full',
          },
          {
            path: 'perustiedot',
            component: BasicDetailsComponent,
          },
          {
            path: 'koulutustiedot',
            component: EducationalDetailsComponent,
          },
          {
            path: 'tarkemmat-tiedot',
            component: ExtendedDetailsComponent,
          },
          {
            path: 'lisenssitiedot',
            component: LicenseDetailsComponent,
          },
          {
            path: 'hyodynnetyt-materiaalit',
            component: BasedOnDetailsComponent,
          },
        ],
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
