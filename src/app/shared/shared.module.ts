import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

import { TruncatePipe } from '../pipes/truncate.pipe';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  declarations: [
    TruncatePipe
  ],
  exports: [
    CommonModule,
    TranslateModule,
    TruncatePipe
  ],
})

export class SharedModule { }

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

export function setLanguage(lang: string) {
  localStorage.setItem('user', JSON.stringify({ lang: lang }));
}

export function getLanguage() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user === null) {
    return undefined;
  } else {
    return user.lang;
  }
}
