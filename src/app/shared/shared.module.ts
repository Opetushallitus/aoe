import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { TruncatePipe } from '../pipes/truncate.pipe';
import { SafePipe } from '../pipes/safe.pipe';
import { User } from '../models/user';

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
  localStorage.setItem('aoe.lang', lang);
}

/**
 * Retrieve language from local storage (if set)
 */
export function getLanguage(): string | null {
  return localStorage.getItem('aoe.lang');
}

export function getLocalStorageData(localStorageKey: string) {
  return JSON.parse(localStorage.getItem(localStorageKey));
}

export const isLoggedIn: boolean = !!getUser();

export function setUser(username: string, firstname: string, lastname: string, acceptance: boolean): void {
  const user: User = {
    username: username,
    firstname: firstname,
    lastname: lastname,
    acceptance: acceptance,
  };

  localStorage.setItem('aoe.user', JSON.stringify(user));
}

export function getUser(): User | null {
  return JSON.parse(localStorage.getItem('aoe.user'));
}

export function removeUser(): void {
  localStorage.removeItem('aoe.user');
}

export function updateAcceptance(value: boolean): void {
  const user: User = JSON.parse(localStorage.getItem('aoe.user'));

  user.acceptance = value;

  localStorage.setItem('aoe.user', JSON.stringify(user));
}
