import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EducationalMaterialEmbedViewComponent } from './educational-material-embed-view.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'etusivu',
        pathMatch: 'full',
    },
    {
        path: '',
        component: EducationalMaterialEmbedViewComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class EmbedViewRoutingModule {}
