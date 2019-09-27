import { NgModule } from '@angular/core';
import { CommonModule, KeyValue } from '@angular/common';
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
 * Save language to local storage.
 * @param {string} lang
 */
export function setLanguage(lang: string): void {
  localStorage.setItem('aoe.lang', lang);
}

/**
 * Retrieve language from local storage (if set).
 * @returns {string | null}
 */
export function getLanguage(): string | null {
  return localStorage.getItem('aoe.lang');
}

/**
 * Returns JSON parsed data from localStorage.
 * @param {string} localStorageKey
 * @returns {string | null}
 */
export function getLocalStorageData(localStorageKey: string): string | null {
  return JSON.parse(localStorage.getItem(localStorageKey));
}

/**
 * Returns given string in Key Value object.
 * @param {string} value
 * @returns {KeyValue<string, string>}
 */
export function addCustomItem(value: string): KeyValue<string, string> {
  return {
    key: value.replace(/[\W_]+/g, '').toLowerCase(),
    value: value,
  };
}
