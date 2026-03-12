import { enableProdMode, importProvidersFrom } from '@angular/core'

import {
  environment,
  loadCiEnv,
  loadDemoEnv,
  loadDevEnv,
  loadProdEnv,
  loadQaEnv
} from './environments/environment'
import { LocationStrategy, HashLocationStrategy } from '@angular/common'
import { CookieService } from 'ngx-cookie-service'
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { CredentialInterceptor, WindowRef } from './app/providers'
import { Title, BrowserModule, bootstrapApplication } from '@angular/platform-browser'
import { UnsavedChangesGuard, AdminGuard, DisableFormsGuard } from './app/guards'
import { DeviceDetectorService } from 'ngx-device-detector'
import { provideTranslateService } from '@ngx-translate/core'
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader'
import { provideAnimations } from '@angular/platform-browser/animations'
import { AppRoutingModule } from './app/app.routing'
import { BsDropdownModule } from 'ngx-bootstrap/dropdown'
import { ModalModule } from 'ngx-bootstrap/modal'
import { SharedModule } from './app/shared/shared.module'
import { AccordionModule } from 'ngx-bootstrap/accordion'
import { NgSelectModule } from '@ng-select/ng-select'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { CollapseModule } from 'ngx-bootstrap/collapse'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { ProgressbarModule } from 'ngx-bootstrap/progressbar'
import { ImageCropperModule } from 'ngx-image-cropper'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { ClipboardModule } from 'ngx-clipboard'
import { ToastrModule } from 'ngx-toastr'
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer'
import { NgxPaginationModule } from 'ngx-pagination'
import { AppComponent } from './app/app.component'

if (environment.production) {
  enableProdMode()
}

fetch('./assets/config/config.json')
  .then((resp) => resp.json())
  .then((config) => {
    if (config.env === 'ci') {
      loadCiEnv()
    } else if (config.env === 'dev') {
      loadDevEnv()
    } else if (config.env === 'demo') {
      loadDemoEnv()
    } else if (config.env === 'qa') {
      loadQaEnv()
    } else if (config.env === 'prod') {
      loadProdEnv()
    }
    bootstrapApplication(AppComponent, {
      providers: [
        importProvidersFrom(
          BrowserModule,
          AppRoutingModule,
          BsDropdownModule.forRoot(),
          ModalModule.forRoot(),
          SharedModule,
          AccordionModule.forRoot(),
          NgSelectModule,
          FormsModule,
          ReactiveFormsModule,
          TooltipModule.forRoot(),
          CollapseModule.forRoot(),
          BsDatepickerModule.forRoot(),
          ProgressbarModule.forRoot(),
          ImageCropperModule,
          DragDropModule,
          ClipboardModule,
          ToastrModule.forRoot(),
          PdfJsViewerModule,
          NgxPaginationModule
        ),
        {
          provide: LocationStrategy,
          useClass: HashLocationStrategy
        },
        CookieService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: CredentialInterceptor,
          multi: true
        },
        Title,
        UnsavedChangesGuard,
        DeviceDetectorService,
        AdminGuard,
        DisableFormsGuard,
        WindowRef,
        provideHttpClient(withInterceptorsFromDi()),
        provideTranslateService({
          loader: provideTranslateHttpLoader({
            prefix: './i18n/',
            suffix: '.json'
          })
        }),
        provideAnimations()
      ]
    }).catch((err) => console.log(err))
  })
