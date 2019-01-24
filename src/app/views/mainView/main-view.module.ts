import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';

import { MainViewComponent } from './main-view.component';
import { MainViewRoutingModule } from './main-view-routing.module';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { OppimateriaaliCardComponent } from '../../components/oppimateriaali-card/oppimateriaali-card.component';
import { DemoMaterialListComponent } from '../demo-material-list/demo-material-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MainViewRoutingModule,
    ChartsModule,
    BsDropdownModule,
    ButtonsModule.forRoot(),
  ],
  declarations: [
    MainViewComponent,
    TruncatePipe,
    OppimateriaaliCardComponent,
    DemoMaterialListComponent,
  ]
})
export class MainViewModule { }
