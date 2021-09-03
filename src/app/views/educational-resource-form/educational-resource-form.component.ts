import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BasedOnDetailsComponent,
  BasicDetailsComponent,
  EducationalDetailsComponent,
  ExtendedDetailsComponent,
  FilesComponent,
  LicenseComponent,
  PreviewComponent,
} from './tabs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-educational-resource-form',
  templateUrl: './educational-resource-form.component.html',
})
export class EducationalResourceFormComponent implements OnInit, OnDestroy {
  private routeSubscription: Subscription;
  public tabId: number;
  abortMessage: string;
  @ViewChild(FilesComponent) filesTab: FilesComponent;
  @ViewChild(BasicDetailsComponent) basicTab: BasicDetailsComponent;
  @ViewChild(EducationalDetailsComponent) educationalTab: EducationalDetailsComponent;
  @ViewChild(ExtendedDetailsComponent) extendedTab: ExtendedDetailsComponent;
  @ViewChild(LicenseComponent) licenseTab: LicenseComponent;
  @ViewChild(BasedOnDetailsComponent) referencesTab: BasedOnDetailsComponent;
  @ViewChild(PreviewComponent) previewTab: PreviewComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.tabId = params['tabId'] ? +params['tabId'] : 1;

      if (!params['tabId']) {
        this.router.navigate(['/lisaa-oppimateriaali', 1]);
      }
    });

    this.translate.get('forms.editEducationalResource.abort.text').subscribe((translation: string) => {
      this.abortMessage = translation;
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();

    sessionStorage.removeItem(environment.newERLSKey);
    sessionStorage.removeItem(environment.fileUploadLSKey);
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    if (
      this.filesTab?.form.dirty
      || this.basicTab?.form.dirty
      || this.educationalTab?.form.dirty
      || this.extendedTab?.form.dirty
      || this.licenseTab?.form.dirty
      || this.referencesTab?.form.dirty
    ) {
      return confirm(this.abortMessage);
    }

    if (this.previewTab?.canDeactivate) {
      return true;
    }

    const materialId = sessionStorage.getItem(environment.fileUploadLSKey);

    return materialId
      ? confirm(this.abortMessage)
      : true;
  }
}
