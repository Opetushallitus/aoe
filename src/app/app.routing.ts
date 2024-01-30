import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import Containers
import { DefaultLayoutComponent } from './containers';

// guards
import { AcceptanceGuard, AdminGuard, AuthGuard, DisableFormsGuard, UnsavedChangesGuard } from './guards';

// views
import {
  AcceptanceViewComponent,
  AccessibilityPolicyViewComponent,
  AccessibilityViewComponent,
  CollectionFormComponent,
  CollectionSearchResultsViewComponent,
  CollectionsViewComponent,
  CollectionViewComponent,
  EducationalMaterialEditFormComponent,
  EducationalMaterialRatingsComponent,
  EducationalMaterialViewComponent,
  EducationalResourceFormComponent,
  HelpViewComponent,
  LogoutViewComponent,
  MainViewComponent,
  P404Component,
  PrivacyPolicyViewComponent,
  SearchResultsViewComponent,
  TermsOfUseViewComponent,
  UserDetailsViewComponent,
  UserMaterialsViewComponent,
} from './views';

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
    },
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
        canActivate: [AcceptanceGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'materiaali/:materialId',
        component: EducationalMaterialViewComponent,
        canActivate: [AcceptanceGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'materiaali/:materialId/arvostelut',
        component: EducationalMaterialRatingsComponent,
        canActivate: [AcceptanceGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'materiaali/:materialId/:versionDate',
        component: EducationalMaterialViewComponent,
        canActivate: [AcceptanceGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'kokoelmat',
        component: CollectionsViewComponent,
        canActivate: [AcceptanceGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'kokoelmat/haku',
        component: CollectionSearchResultsViewComponent,
        canActivate: [AcceptanceGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'kokoelma/:collectionId',
        component: CollectionViewComponent,
        canActivate: [AcceptanceGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'kokoelma/:collectionId/muokkaa',
        component: CollectionFormComponent,
        canActivate: [AuthGuard, AcceptanceGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'kokoelma/:collectionId/muokkaa/:tabId',
        component: CollectionFormComponent,
        canActivate: [AuthGuard, AcceptanceGuard],
        canDeactivate: [UnsavedChangesGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'lisatietoa',
        component: HelpViewComponent,
        canActivate: [AcceptanceGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'omat-tiedot',
        component: UserDetailsViewComponent,
        canActivate: [AuthGuard, AcceptanceGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'omat-oppimateriaalit',
        component: UserMaterialsViewComponent,
        canActivate: [AuthGuard, AcceptanceGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'lisaa-oppimateriaali',
        component: EducationalResourceFormComponent,
        canActivate: [AuthGuard, AcceptanceGuard, DisableFormsGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'lisaa-oppimateriaali/:tabId',
        component: EducationalResourceFormComponent,
        canActivate: [AuthGuard, AcceptanceGuard, DisableFormsGuard],
        canDeactivate: [UnsavedChangesGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'muokkaa-oppimateriaalia/:materialId',
        component: EducationalMaterialEditFormComponent,
        canActivate: [AuthGuard, AcceptanceGuard, DisableFormsGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'muokkaa-oppimateriaalia/:materialId/:tabId',
        component: EducationalMaterialEditFormComponent,
        canActivate: [AuthGuard, AcceptanceGuard, DisableFormsGuard],
        canDeactivate: [UnsavedChangesGuard],
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
        canActivate: [AuthGuard],
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
    loadChildren: () => import('./embed-view/embed-view.module').then((m) => m.EmbedViewModule),
  },
  {
    path: 'bryssel',
    loadChildren: () => import('./admin/admin.module').then((m) => m.AdminModule),
    canActivate: [AuthGuard, AdminGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: '**',
    redirectTo: '/404',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      relativeLinkResolution: 'legacy',
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
