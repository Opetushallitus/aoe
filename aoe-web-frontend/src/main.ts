import { enableProdMode, importProvidersFrom, provideZoneChangeDetection } from '@angular/core'

import {
  environment,
  loadCiEnv,
  loadDemoEnv,
  loadDevEnv,
  loadProdEnv,
  loadQaEnv
} from './environments/environment'
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
import { ImageCropperComponent } from 'ngx-image-cropper'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer'
import { NgxPaginationModule } from 'ngx-pagination'
import { AppComponent } from './app/app.component'

// Redirect legacy hash URLs (shared links, external embed iframes) to path form.
// e.g. https://aoe.fi/#/materiaali/6010 -> https://aoe.fi/materiaali/6010
// Require a single leading slash: '#//evil.com' is protocol-relative and would redirect off-site.
if (location.hash.startsWith('#/') && !location.hash.startsWith('#//')) {
  location.replace(location.hash.slice(1))
}

if (environment.production) {
  enableProdMode()
}

fetch('/assets/config/config.json')
  .then((resp) => resp.json())
  .then((config) => {
    const envLoaders: Record<string, () => void> = {
      ci: loadCiEnv,
      dev: loadDevEnv,
      demo: loadDemoEnv,
      qa: loadQaEnv,
      prod: loadProdEnv
    }
    const loadEnv = envLoaders[config.env]

    if (!loadEnv) {
      throw new Error(
        `Unknown config.env="${config.env}"; expected one of ${Object.keys(envLoaders).join(', ')}`
      )
    }
    loadEnv()
    bootstrapApplication(AppComponent, {
      providers: [
        provideZoneChangeDetection(),
        importProvidersFrom(
          BrowserModule,
          AppRoutingModule,
          BsDropdownModule,
          ModalModule,
          SharedModule,
          AccordionModule,
          NgSelectModule,
          FormsModule,
          ReactiveFormsModule,
          TooltipModule,
          CollapseModule,
          BsDatepickerModule,
          ProgressbarModule,
          ImageCropperComponent,
          DragDropModule,
          PdfJsViewerModule,
          NgxPaginationModule
        ),
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
            prefix: '/i18n/',
            suffix: '.json'
          })
        }),
        provideAnimations()
      ]
    }).catch((err) => console.log(err))
  })
