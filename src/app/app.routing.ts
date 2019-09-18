import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import Containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { MainViewComponent } from './views/mainView/main-view.component';
import { EducationalMaterialViewComponent } from './views/educational-material-view/educational-material-view.component';
import { EducationalResourceFormComponent } from './views/educational-resource-form/educational-resource-form.component';
import { HelpViewComponent } from './views/help-view/help-view.component';
import { TermsOfUseViewComponent } from './views/terms-of-use-view/terms-of-use-view.component';
import { PrivacyPolicyViewComponent } from './views/privacy-policy-view/privacy-policy-view.component';
import { AcceptanceViewComponent } from './views/acceptance-view/acceptance-view.component';
import { AcceptanceGuard } from './guards/acceptance.guard';
import { UserMaterialsViewComponent } from './views/user-materials-view/user-materials-view.component';
import { AuthGuard } from './guards/auth.guard';

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
      title: 'Home',
    },
    children: [
      {
        path: 'etusivu',
        component: MainViewComponent,
        canActivate: [ AcceptanceGuard ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'materiaali/:specialId/:slug',
        component: EducationalMaterialViewComponent,
        canActivate: [ AcceptanceGuard ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'lisatietoa',
        component: HelpViewComponent,
        canActivate: [ AcceptanceGuard ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'omat-oppimateriaalit',
        component: UserMaterialsViewComponent,
        canActivate: [ AuthGuard, AcceptanceGuard ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'lisaa-oppimateriaali',
        component: EducationalResourceFormComponent,
        canActivate: [ AuthGuard, AcceptanceGuard ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'lisaa-oppimateriaali/:tabId',
        component: EducationalResourceFormComponent,
        canActivate: [ AuthGuard, AcceptanceGuard ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'kayttoehdot',
        component: TermsOfUseViewComponent,
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'tietosuojaseloste',
        component: PrivacyPolicyViewComponent,
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'hyvaksynta',
        component: AcceptanceViewComponent,
        canActivate: [ AuthGuard ],
        runGuardsAndResolvers: 'always',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/404',
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
