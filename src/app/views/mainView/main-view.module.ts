import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { SharedModule } from '../../shared/shared.module';

import { MainViewComponent } from './main-view.component';
import { MainViewRoutingModule } from './main-view-routing.module';

import { EducationalMaterialsListComponent } from '../../components/educational-materials-list/educational-materials-list.component';
import { EducationalMaterialCardComponent } from '../../components/educational-material-card/educational-material-card.component';

@NgModule({
  imports: [
    FormsModule,
    MainViewRoutingModule,
    ChartsModule,
    BsDropdownModule,
    ButtonsModule.forRoot(),
    SharedModule,
  ],
  declarations: [
    MainViewComponent,
    EducationalMaterialsListComponent,
    EducationalMaterialCardComponent,
  ]
})
export class MainViewModule { }
