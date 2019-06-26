import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabsetComponent } from 'ngx-bootstrap';

@Component({
  selector: 'app-educational-resource-form',
  templateUrl: './educational-resource-form.component.html',
})
export class EducationalResourceFormComponent implements OnInit, OnDestroy {
  @ViewChild('formTabs', { static: true }) formTabsRef: TabsetComponent;

  private routeSubscription: Subscription;
  private tabId: number;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.tabId = +params['tabId'];

      if (this.tabId) {
        this.formTabsRef.tabs[this.tabId - 1].active = true;
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }
}
