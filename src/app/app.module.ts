import { BrowserModule, HammerModule, Title } from '@angular/platform-browser';
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
import { NgSelectModule } from '@ng-select/ng-select';
import { ImageCropperModule } from 'ngx-image-cropper';
import { CookieService } from 'ngx-cookie-service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ClipboardModule } from 'ngx-clipboard';
import { ToastrModule } from 'ngx-toastr';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { NgxPaginationModule } from 'ngx-pagination';

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
import { EducationalMaterialCardComponent } from '@components/educational-material-card/educational-material-card.component';
import { PreviewComponent } from '@views/educational-resource-form/tabs/preview/preview.component';
import { CookieNoticeComponent } from '@components/cookie-notice/cookie-notice.component';
import { CredentialInterceptor } from './providers/credential.interceptor';
import { LogoutViewComponent } from '@views/logout-view/logout-view.component';
import { EducationalMaterialEmbedViewComponent } from '@views/educational-material-embed-view/educational-material-embed-view.component';
import { SearchComponent } from '@components/search/search.component';
import { SearchResultsViewComponent } from '@views/search-results-view/search-results-view.component';
import { SearchResultComponent } from '@components/search-result/search-result.component';
import { EducationalMaterialEditFormComponent } from '@views/educational-material-edit-form/educational-material-edit-form.component';
import { EditFilesComponent } from '@views/educational-material-edit-form/tabs/edit-files/edit-files.component';
import { EditBasicDetailsComponent } from '@views/educational-material-edit-form/tabs/edit-basic-details/edit-basic-details.component';
// tslint:disable-next-line:max-line-length
import { EditEducationalDetailsComponent } from '@views/educational-material-edit-form/tabs/edit-educational-details/edit-educational-details.component';
// tslint:disable-next-line:max-line-length
import { EditExtendedDetailsComponent } from '@views/educational-material-edit-form/tabs/edit-extended-details/edit-extended-details.component';
import { EditLicenseComponent } from '@views/educational-material-edit-form/tabs/edit-license/edit-license.component';
// tslint:disable-next-line:max-line-length
import { EditBasedOnDetailsComponent } from '@views/educational-material-edit-form/tabs/edit-based-on-details/edit-based-on-details.component';
import { EditPreviewComponent } from '@views/educational-material-edit-form/tabs/edit-preview/edit-preview.component';
import { EducationalMaterialRatingsComponent } from '@views/educational-material-ratings/educational-material-ratings.component';
// tslint:disable-next-line:max-line-length
import { EducationalMaterialRatingModalComponent } from '@components/educational-material-rating-modal/educational-material-rating-modal.component';
import { AddToCollectionModalComponent } from '@components/add-to-collection-modal/add-to-collection-modal.component';
import { CollectionViewComponent } from '@views/collection-view/collection-view.component';
import { MaterialLanguagePipe } from './pipes/material-language.pipe';
import { CleanFilenamePipe } from './pipes/clean-filename.pipe';
import { CollectionFormComponent } from '@views/collection-form/collection-form.component';
// tslint:disable-next-line:max-line-length
import { CollectionBasicDetailsTabComponent } from '@views/collection-form/collection-basic-details-tab/collection-basic-details-tab.component';
// tslint:disable-next-line:max-line-length
import { CollectionEducationalDetailsTabComponent } from '@views/collection-form/collection-educational-details-tab/collection-educational-details-tab.component';
import { CollectionMaterialsTabComponent } from '@views/collection-form/collection-materials-tab/collection-materials-tab.component';
import { CollectionPreviewTabComponent } from '@views/collection-form/collection-preview-tab/collection-preview-tab.component';
import { TaglistComponent } from '@components/taglist/taglist.component';
import { CollectionsViewComponent } from '@views/collections-view/collections-view.component';
import { CollectionCardComponent } from '@components/collection-card/collection-card.component';
import { CollectionSearchResultsViewComponent } from '@views/collection-search-results-view/collection-search-results-view.component';
import { CollectionSearchResultComponent } from '@components/collection-search-result/collection-search-result.component';

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
    ToastrModule.forRoot(),
    HammerModule,
    PdfJsViewerModule,
    NgxPaginationModule,
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
    EducationalMaterialCardComponent,
    EducationalMaterialViewComponent,
    EducationalMaterialPreviewComponent,
    VideoPreviewComponent,
    AudioPreviewComponent,
    PdfPreviewComponent,
    HtmlPreviewComponent,
    OfficePreviewComponent,
    ImagePreviewComponent,
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
    SearchResultComponent,
    EducationalMaterialEditFormComponent,
    EditFilesComponent,
    EditBasicDetailsComponent,
    EditEducationalDetailsComponent,
    EditExtendedDetailsComponent,
    EditLicenseComponent,
    EditBasedOnDetailsComponent,
    EditPreviewComponent,
    EducationalMaterialRatingsComponent,
    EducationalMaterialRatingModalComponent,
    AddToCollectionModalComponent,
    CollectionViewComponent,
    MaterialLanguagePipe,
    CleanFilenamePipe,
    CollectionFormComponent,
    CollectionBasicDetailsTabComponent,
    CollectionEducationalDetailsTabComponent,
    CollectionMaterialsTabComponent,
    CollectionPreviewTabComponent,
    TaglistComponent,
    CollectionsViewComponent,
    CollectionCardComponent,
    CollectionSearchResultsViewComponent,
    CollectionSearchResultComponent,
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
    },
    Title,
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
