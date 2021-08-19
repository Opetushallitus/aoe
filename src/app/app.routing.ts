import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import Containers
import { DefaultLayoutComponent } from './containers';

// guards
import { AcceptanceGuard } from './guards';
import { AuthGuard } from './guards';
import { UnsavedChangesGuard } from './guards';
import { AdminGuard } from './guards';
import { DisableFormsGuard } from './guards';

// views
import { P404Component } from './views';
import { MainViewComponent } from './views';
import { EducationalMaterialViewComponent } from './views';
import { EducationalResourceFormComponent } from './views';
import { HelpViewComponent } from './views';
import { TermsOfUseViewComponent } from './views';
import { PrivacyPolicyViewComponent } from './views';
import { AcceptanceViewComponent } from './views';
import { UserMaterialsViewComponent } from './views';
import { LogoutViewComponent } from './views';
import { EducationalMaterialEmbedViewComponent } from './views';
import { AccessibilityPolicyViewComponent } from './views';
import { SearchResultsViewComponent } from './views';
import { EducationalMaterialEditFormComponent } from './views';
import { EducationalMaterialRatingsComponent } from './views';
import { CollectionViewComponent } from './views';
import { CollectionFormComponent } from './views';
import { CollectionsViewComponent } from './views';
import { CollectionSearchResultsViewComponent } from './views';
import { UserDetailsViewComponent } from './views';
import { AccessibilityViewComponent } from './views';

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
        path: 'materiaali/:materialId/arvostelut',
        component: EducationalMaterialRatingsComponent,
        canActivate: [ AcceptanceGuard ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'materiaali/:materialId/:versionDate',
        component: EducationalMaterialViewComponent,
        canActivate: [ AcceptanceGuard ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'kokoelmat',
        component: CollectionsViewComponent,
        canActivate: [ AcceptanceGuard ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'kokoelmat/haku',
        component: CollectionSearchResultsViewComponent,
        canActivate: [ AcceptanceGuard ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'kokoelma/:collectionId',
        component: CollectionViewComponent,
        canActivate: [ AcceptanceGuard ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'kokoelma/:collectionId/muokkaa',
        component: CollectionFormComponent,
        canActivate: [ AuthGuard, AcceptanceGuard ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'kokoelma/:collectionId/muokkaa/:tabId',
        component: CollectionFormComponent,
        canActivate: [ AuthGuard, AcceptanceGuard ],
        canDeactivate: [ UnsavedChangesGuard ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'lisatietoa',
        component: HelpViewComponent,
        canActivate: [ AcceptanceGuard ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'omat-tiedot',
        component: UserDetailsViewComponent,
        canActivate: [ AuthGuard, AcceptanceGuard ],
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
        canActivate: [ AuthGuard, AcceptanceGuard, DisableFormsGuard ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'lisaa-oppimateriaali/:tabId',
        component: EducationalResourceFormComponent,
        canActivate: [ AuthGuard, AcceptanceGuard, DisableFormsGuard ],
        canDeactivate: [ UnsavedChangesGuard ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'muokkaa-oppimateriaalia/:materialId',
        component: EducationalMaterialEditFormComponent,
        canActivate: [ AuthGuard, AcceptanceGuard, DisableFormsGuard ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'muokkaa-oppimateriaalia/:materialId/:tabId',
        component: EducationalMaterialEditFormComponent,
        canActivate: [ AuthGuard, AcceptanceGuard, DisableFormsGuard ],
        canDeactivate: [ UnsavedChangesGuard ],
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
      {
        path: 'haku',
        component: SearchResultsViewComponent,
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'saavutettavuus',
        component: AccessibilityViewComponent,
        runGuardsAndResolvers: 'always',
      },
    ],
  },
  {
    path: 'embed/:materialId/:lang',
    component: EducationalMaterialEmbedViewComponent,
  },
  {
    path: 'bryssel',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [
      AuthGuard,
      AdminGuard,
    ],
    runGuardsAndResolvers: 'always',
  },
  {
    path: '**',
    redirectTo: '/404',
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
