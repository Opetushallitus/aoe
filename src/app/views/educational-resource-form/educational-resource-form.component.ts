import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-educational-resource-form',
  templateUrl: './educational-resource-form.component.html',
})
export class EducationalResourceFormComponent implements OnInit, OnDestroy {
  private routeSubscription: Subscription;
  public tabId: number;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.tabId = params['tabId'] ? +params['tabId'] : 1;
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }
}
