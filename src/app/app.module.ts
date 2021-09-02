import { BrowserModule, HammerModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

// Import containers
import { DefaultLayoutComponent } from './containers';

const APP_CONTAINERS = [
  DefaultLayoutComponent
];

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
import { DeviceDetectorService } from 'ngx-device-detector';

// shared
import { SharedModule, HttpLoaderFactory } from './shared/shared.module';

// components
import { EducationalMaterialPreviewComponent } from '@components/educational-material-preview/educational-material-preview.component';
import { VideoPreviewComponent } from '@components/video-preview/video-preview.component';
import { AudioPreviewComponent } from '@components/audio-preview/audio-preview.component';
import { PdfPreviewComponent } from '@components/pdf-preview/pdf-preview.component';
import { HtmlPreviewComponent } from '@components/html-preview/html-preview.component';
import { OfficePreviewComponent } from '@components/office-preview/office-preview.component';
import { ImagePreviewComponent } from '@components/image-preview/image-preview.component';
import { NavLoginComponent } from '@components/nav-login/nav-login.component';
import { PrivacyPolicyComponent } from '@components/privacy-policy/privacy-policy.component';
import { TermsOfUseComponent } from '@components/terms-of-use/terms-of-use.component';
import { EducationalMaterialCardComponent } from '@components/educational-material-card/educational-material-card.component';
import { CookieNoticeComponent } from '@components/cookie-notice/cookie-notice.component';
import { SearchComponent } from '@components/search/search.component';
import { SearchResultComponent } from '@components/search-result/search-result.component';
import { EducationalMaterialRatingModalComponent } from '@components/educational-material-rating-modal/educational-material-rating-modal.component';
import { AddToCollectionModalComponent } from '@components/add-to-collection-modal/add-to-collection-modal.component';
import { TaglistComponent } from '@components/taglist/taglist.component';
import { CollectionCardComponent } from '@components/collection-card/collection-card.component';
import { CollectionSearchResultComponent } from '@components/collection-search-result/collection-search-result.component';
import { SocialMetadataModalComponent } from '@components/social-metadata-modal/social-metadata-modal.component';
import { ArchivedMaterialComponent } from '@components/archived-material/archived-material.component';
import { PreviewRowComponent } from '@components/preview-row/preview-row.component';

// directives
import { FocusRemoverDirective } from './directives';

// guards
import { UnsavedChangesGuard } from './guards';
import { AdminGuard } from './guards';
import { DisableFormsGuard } from './guards';

// pipes
import { MaterialLanguagePipe } from './pipes';
import { CleanFilenamePipe } from './pipes';

// providers
import { CredentialInterceptor } from './providers';

// views
import { P404Component } from './views';
import { HelpViewComponent } from './views';
import { TermsOfUseViewComponent } from './views';
import { PrivacyPolicyViewComponent } from './views';
import { AccessibilityPolicyViewComponent } from './views';
import { EducationalMaterialViewComponent } from './views';
import { AcceptanceViewComponent } from './views';
import { EducationalResourceFormComponent } from './views';
import { FilesComponent } from './views/educational-resource-form/tabs';
import { BasicDetailsComponent } from './views/educational-resource-form/tabs';
import { EducationalDetailsComponent } from './views/educational-resource-form/tabs';
import { ExtendedDetailsComponent } from './views/educational-resource-form/tabs';
import { BasedOnDetailsComponent } from './views/educational-resource-form/tabs';
import { LicenseComponent } from './views/educational-resource-form/tabs';
import { UserMaterialsViewComponent } from './views';
import { MainViewComponent } from './views';
import { PreviewComponent } from './views/educational-resource-form/tabs';
import { LogoutViewComponent } from './views';
import { EducationalMaterialEmbedViewComponent } from './views';
import { SearchResultsViewComponent } from './views';
import { EducationalMaterialEditFormComponent } from './views';
import { EditFilesComponent } from './views/educational-material-edit-form/tabs';
import { EditBasicDetailsComponent } from './views/educational-material-edit-form/tabs';
import { EditEducationalDetailsComponent } from './views/educational-material-edit-form/tabs';
import { EditExtendedDetailsComponent } from './views/educational-material-edit-form/tabs';
import { EditLicenseComponent } from './views/educational-material-edit-form/tabs';
import { EditBasedOnDetailsComponent } from './views/educational-material-edit-form/tabs';
import { EditPreviewComponent } from './views/educational-material-edit-form/tabs';
import { EducationalMaterialRatingsComponent } from './views';
import { CollectionViewComponent } from './views';
import { CollectionFormComponent } from './views';
import { CollectionBasicDetailsTabComponent } from './views/collection-form';
import { CollectionEducationalDetailsTabComponent } from './views/collection-form';
import { CollectionMaterialsTabComponent } from './views/collection-form';
import { CollectionPreviewTabComponent } from './views/collection-form';
import { CollectionsViewComponent } from './views';
import { CollectionSearchResultsViewComponent } from './views';
import { UserDetailsViewComponent } from './views';
import { AccessibilityViewComponent } from './views';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
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
    FocusRemoverDirective,
    UserDetailsViewComponent,
    SocialMetadataModalComponent,
    ArchivedMaterialComponent,
    AccessibilityViewComponent,
    PreviewRowComponent,
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
    UnsavedChangesGuard,
    DeviceDetectorService,
    AdminGuard,
    DisableFormsGuard,
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
