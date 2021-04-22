import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccessibilityFeature } from '@models/koodisto-proxy/accessibility-feature';
import { AccessibilityHazard } from '@models/koodisto-proxy/accessibility-hazard';
import { KoodistoProxyService } from '@services/koodisto-proxy.service';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-accessibility-view',
  templateUrl: './accessibility-view.component.html',
  styleUrls: ['./accessibility-view.component.scss']
})
export class AccessibilityViewComponent implements OnInit, OnDestroy {
  accessibilityFeatureSubscription: Subscription;
  accessibilityFeatures: AccessibilityFeature[];
  accessibilityHazardSubscription: Subscription;
  accessibilityHazards: AccessibilityHazard[];
  isOpen = false;

  constructor(
    private koodistoSvc: KoodistoProxyService,
    private titleSvc: Title,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.setTitle();

    this.translate.onLangChange.subscribe(() => {
      this.setTitle();

      this.koodistoSvc.updateAccessibilityFeatures();
      this.koodistoSvc.updateAccessibilityHazards();
    });

    this.accessibilityFeatureSubscription = this.koodistoSvc.accessibilityFeatures$
      .subscribe((features: AccessibilityFeature[]) => {
        this.accessibilityFeatures = features;
      });
    this.koodistoSvc.updateAccessibilityFeatures();

    // accessibility hazards
    this.accessibilityHazardSubscription = this.koodistoSvc.accessibilityHazards$
      .subscribe((hazards: AccessibilityHazard[]) => {
        this.accessibilityHazards = hazards;
      });
    this.koodistoSvc.updateAccessibilityHazards();
  }

  ngOnDestroy(): void {
    this.accessibilityFeatureSubscription.unsubscribe();
    this.accessibilityHazardSubscription.unsubscribe();
  }

  setTitle(): void {
    this.translate.get('titles.accessibility').subscribe((title: string) => {
      this.titleSvc.setTitle(`${title} ${environment.title}`);
    });
  }
}
