import { Component, ViewChild } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap';

@Component({
  selector: 'app-educational-resource-form',
  templateUrl: './educational-resource-form.component.html',
})
export class EducationalResourceFormComponent {
  @ViewChild('formTabs') formTabsRef: TabsetComponent;

  constructor() { }
}
