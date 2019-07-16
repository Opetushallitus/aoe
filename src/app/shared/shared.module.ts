import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { TruncatePipe } from '../pipes/truncate.pipe';
import { SafePipe } from '../pipes/safe.pipe';

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
    TruncatePipe,
    SafePipe,
  ],
  exports: [
    CommonModule,
    TranslateModule,
    TruncatePipe,
    SafePipe,
  ],
})

export class SharedModule { }

/**
 * @ignore
 */
// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

/**
 * Save language to local storage
 */
export function setLanguage(lang: string): void {
  localStorage.setItem('user', JSON.stringify({ lang: lang }));
}

/**
 * Retrieve language from local storage (if set)
 */
export function getLanguage(): string | undefined {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user === null) {
    return undefined;
  } else {
    return user.lang;
  }
}

export function getLocalStorageData(localStorageKey: string) {
  return JSON.parse(localStorage.getItem(localStorageKey));
}
