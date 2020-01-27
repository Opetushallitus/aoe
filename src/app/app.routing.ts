import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import Containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from '@views/error/404.component';
import { MainViewComponent } from '@views/mainView/main-view.component';
import { EducationalMaterialViewComponent } from '@views/educational-material-view/educational-material-view.component';
import { EducationalResourceFormComponent } from '@views/educational-resource-form/educational-resource-form.component';
import { HelpViewComponent } from '@views/help-view/help-view.component';
import { TermsOfUseViewComponent } from '@views/terms-of-use-view/terms-of-use-view.component';
import { PrivacyPolicyViewComponent } from '@views/privacy-policy-view/privacy-policy-view.component';
import { AcceptanceViewComponent } from '@views/acceptance-view/acceptance-view.component';
import { AcceptanceGuard } from './guards/acceptance.guard';
import { UserMaterialsViewComponent } from '@views/user-materials-view/user-materials-view.component';
import { AuthGuard } from './guards/auth.guard';
import { FileUploadGuard } from './guards/file-upload.guard';
import { LogoutViewComponent } from '@views/logout-view/logout-view.component';
import { EducationalMaterialEmbedViewComponent } from '@views/educational-material-embed-view/educational-material-embed-view.component';
import { AccessibilityPolicyViewComponent } from '@views/accessibility-policy-view/accessibility-policy-view.component';

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
        path: 'materiaali/:materialId',
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
        canActivate: [ AuthGuard, AcceptanceGuard, FileUploadGuard ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'kayttoehdot',
        component: TermsOfUseViewComponent,
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'tietosuojailmoitus',
        component: PrivacyPolicyViewComponent,
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'saavutettavuusseloste',
        component: AccessibilityPolicyViewComponent,
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'hyvaksynta',
        component: AcceptanceViewComponent,
        canActivate: [ AuthGuard ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'logout',
        component: LogoutViewComponent,
        runGuardsAndResolvers: 'always',
      },
    ],
  },
  {
    path: 'embed/:materialId/:lang',
    component: EducationalMaterialEmbedViewComponent,
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
