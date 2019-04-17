import { Component, OnInit, ViewChild } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap';

@Component({
  selector: 'app-educational-resource-form',
  templateUrl: './educational-resource-form.component.html',
})
export class EducationalResourceFormComponent implements OnInit {
  @ViewChild('formTabs') formTabs: TabsetComponent;

  constructor() { }

  ngOnInit() { }

  private selectTab(tabId: number): void {
    this.formTabs.tabs[tabId].active = true;
  }
}
