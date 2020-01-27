import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

// Import containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from '@views/error/404.component';

const APP_CONTAINERS = [
  DefaultLayoutComponent
];

import {
  AppBreadcrumbModule,
  AppFooterModule,
  AppSidebarModule,
} from '@coreui/angular';

// Import routing module
import { AppRoutingModule } from './app.routing';

// Import 3rd party components
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { AlertModule } from 'ngx-bootstrap/alert';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { NgSelectModule } from '@ng-select/ng-select';
import { ImageCropperModule } from 'ngx-image-cropper';
import { CookieService } from 'ngx-cookie-service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ClipboardModule } from 'ngx-clipboard';

import { SharedModule, HttpLoaderFactory } from './shared/shared.module';

import { HelpViewComponent } from '@views/help-view/help-view.component';
import { TermsOfUseViewComponent } from '@views/terms-of-use-view/terms-of-use-view.component';
import { PrivacyPolicyViewComponent } from '@views/privacy-policy-view/privacy-policy-view.component';
import { AccessibilityPolicyViewComponent } from '@views/accessibility-policy-view/accessibility-policy-view.component';
import { EducationalMaterialViewComponent } from '@views/educational-material-view/educational-material-view.component';
import { EducationalMaterialPreviewComponent } from '@components/educational-material-preview/educational-material-preview.component';
import { VideoPreviewComponent } from '@components/video-preview/video-preview.component';
import { AudioPreviewComponent } from '@components/audio-preview/audio-preview.component';
import { PdfPreviewComponent } from '@components/pdf-preview/pdf-preview.component';
import { HtmlPreviewComponent } from '@components/html-preview/html-preview.component';
import { OfficePreviewComponent } from '@components/office-preview/office-preview.component';
import { ImagePreviewComponent } from '@components/image-preview/image-preview.component';
import { InfoViewComponent } from '@views/info-view/info-view.component';
import { AcceptanceViewComponent } from '@views/acceptance-view/acceptance-view.component';
import { EducationalResourceFormComponent } from '@views/educational-resource-form/educational-resource-form.component';
import { FilesComponent } from '@views/educational-resource-form/tabs/files/files.component';
import { BasicDetailsComponent } from '@views/educational-resource-form/tabs/basic-details/basic-details.component';
import { EducationalDetailsComponent } from '@views/educational-resource-form/tabs/educational-details/educational-details.component';
import { ExtendedDetailsComponent } from '@views/educational-resource-form/tabs/extended-details/extended-details.component';
import { BasedOnDetailsComponent } from '@views/educational-resource-form/tabs/based-on-details/based-on-details.component';
import { DialogComponent } from '@components/dialog/dialog.component';
import { LicenseComponent } from '@views/educational-resource-form/tabs/license/license.component';
import { NavLoginComponent } from '@components/nav-login/nav-login.component';
import { PrivacyPolicyComponent } from '@components/privacy-policy/privacy-policy.component';
import { TermsOfUseComponent } from '@components/terms-of-use/terms-of-use.component';
import { UserMaterialsViewComponent } from '@views/user-materials-view/user-materials-view.component';
import { MainViewComponent } from '@views/mainView/main-view.component';
import { EducationalMaterialsListComponent } from '@components/educational-materials-list/educational-materials-list.component';
import { EducationalMaterialCardComponent } from '@components/educational-material-card/educational-material-card.component';
import { PreviewComponent } from '@views/educational-resource-form/tabs/preview/preview.component';
import { CookieNoticeComponent } from '@components/cookie-notice/cookie-notice.component';
import { CredentialInterceptor } from './providers/credential.interceptor';
import { LogoutViewComponent } from '@views/logout-view/logout-view.component';
import { EducationalMaterialEmbedViewComponent } from '@views/educational-material-embed-view/educational-material-embed-view.component';
import { SearchComponent } from '@components/search/search.component';
import { SearchResultsViewComponent } from '@views/search-results-view/search-results-view.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AppBreadcrumbModule.forRoot(),
    AppFooterModule,
    AppSidebarModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    SharedModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    AccordionModule.forRoot(),
    NgxExtendedPdfViewerModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    AlertModule.forRoot(),
    TooltipModule.forRoot(),
    CollapseModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ProgressbarModule.forRoot(),
    ImageCropperModule,
    DragDropModule,
    ClipboardModule,
  ],
  declarations: [
    AppComponent,
    ...APP_CONTAINERS,
    P404Component,
    MainViewComponent,
    HelpViewComponent,
    TermsOfUseViewComponent,
    PrivacyPolicyViewComponent,
    AccessibilityPolicyViewComponent,
    EducationalMaterialsListComponent,
    EducationalMaterialCardComponent,
    EducationalMaterialViewComponent,
    EducationalMaterialPreviewComponent,
    VideoPreviewComponent,
    AudioPreviewComponent,
    PdfPreviewComponent,
    HtmlPreviewComponent,
    OfficePreviewComponent,
    ImagePreviewComponent,
    InfoViewComponent,
    EducationalResourceFormComponent,
    FilesComponent,
    BasicDetailsComponent,
    EducationalDetailsComponent,
    ExtendedDetailsComponent,
    BasedOnDetailsComponent,
    DialogComponent,
    LicenseComponent,
    AcceptanceViewComponent,
    NavLoginComponent,
    PrivacyPolicyComponent,
    TermsOfUseComponent,
    UserMaterialsViewComponent,
    PreviewComponent,
    CookieNoticeComponent,
    LogoutViewComponent,
    EducationalMaterialEmbedViewComponent,
    SearchComponent,
    SearchResultsViewComponent,
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CredentialInterceptor,
      multi: true,
    }
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
