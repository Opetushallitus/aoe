import { NgModule } from '@angular/core';
import { CommonModule, KeyValue } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { TruncatePipe } from '../pipes/truncate.pipe';
import { SafePipe } from '../pipes/safe.pipe';
import { AlignmentObjectExtended } from '@models/alignment-object-extended';
import { koodistoSources } from '../constants/koodisto-sources';
import { AbstractControl, ValidatorFn } from '@angular/forms';

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

/**
 * Returns deduplicated array.
 * @param {any[]} array
 * @param {string} prop
 * @returns {any[]} Deduplicated array
 */
export function deduplicate(array: any[], prop: string): any[] {
  // https://gist.github.com/Vheissu/71dd683ad647e82a0d132076cf6eeef2#gistcomment-2598267
  return Array.from(new Map(array.map((i) => [(prop in i) ? i[prop] : i, i])).values());
}

/**
 * Converts string value to early childhood subject Alignment Object.
 * @param {string} value
 * @returns {AlignmentObjectExtended} Alignment Object
 */
export const addEarlyChildhoodEducationSubject = (value: string): AlignmentObjectExtended => {
  return {
    key: value.replace(/[\W_]+/g, '').trim().toLowerCase(),
    source: 'earlyChildhoodEducationSubjects',
    alignmentType: 'educationalSubject',
    targetName: value.trim(),
  };
};

/**
 * Converts string value to early childhood objective Alignment Object.
 * @param {string} value
 * @returns {AlignmentObjectExtended} Alignment Object
 */
export const addEarlyChildhoodEducationObjective = (value: string): AlignmentObjectExtended => {
  return {
    key: value.replace(/[\W_]+/g, '').trim().toLowerCase(),
    source: 'earlyChildhoodEducationObjectives',
    alignmentType: 'teaches',
    targetName: value.trim(),
  };
};

/**
 * Converts string value to pre-primary subject Alignment Object.
 * @param {string} value
 * @returns {AlignmentObjectExtended} Alignment Object
 */
export const addPrePrimaryEducationSubject = (value: string): AlignmentObjectExtended => {
  return {
    key: value.replace(/[\W_]+/g, '').trim().toLowerCase(),
    source: 'prePrimaryEducationSubjects',
    alignmentType: 'educationalSubject',
    targetName: value.trim(),
  };
};

/**
 * Converts string value to pre-primary objective Alignment Object.
 * @param {string} value
 * @returns {AlignmentObjectExtended} Alignment Object
 */
export const addPrePrimaryEducationObjective = (value: string): AlignmentObjectExtended => {
  return {
    key: value.replace(/[\W_]+/g, '').trim().toLowerCase(),
    source: 'prePrimaryEducationObjectives',
    alignmentType: 'teaches',
    targetName: value.trim(),
  };
};

/**
 * Converts string value to upper secondary school objective Alignment Object.
 * @param {string} value
 * @returns {AlignmentObjectExtended} Alignment Object
 */
export const addUpperSecondarySchoolObjective = (value: string): AlignmentObjectExtended => {
  return {
    key: value.replace(/[\W_]+/g, '').trim().toLowerCase(),
    source: 'upperSecondarySchoolObjectives',
    alignmentType: 'teaches',
    targetName: value.trim(),
  };
};

/**
 * Converts string value to vocational education objective Alignment Object.
 * @param {string} value
 * @returns {AlignmentObjectExtended} Alignment Object
 */
export const addVocationalEducationObjective = (value: string): AlignmentObjectExtended => {
  return {
    key: value.replace(/[\W_]+/g, '').trim().toLowerCase(),
    source: koodistoSources.vocationalRequirements,
    alignmentType: 'teaches',
    targetName: value.trim(),
  };
};

/**
 * Converts string value to self-motivated competence development subject Alignment Object.
 * @param {string} value
 * @returns {AlignmentObjectExtended} Alignment Object
 */
export const addSelfMotivatedEducationSubject = (value: string): AlignmentObjectExtended => {
  return {
    key: value.replace(/[\W_]+/g, '').trim().toLowerCase(),
    source: 'selfMotivatedEducationSubjects',
    alignmentType: 'educationalSubject',
    targetName: value.trim(),
  };
};

/**
 * Converts string value to self-motivated competence development objective Alignment Object.
 * @param {string} value
 * @returns {AlignmentObjectExtended} Alignment Object
 */
export const addSelfMotivatedEducationObjective = (value: string): AlignmentObjectExtended => {
  return {
    key: value.replace(/[\W_]+/g, '').trim().toLowerCase(),
    source: 'selfMotivatedEducationObjectives',
    alignmentType: 'teaches',
    targetName: value.trim(),
  };
};

/**
 * Converts string value to higher education objective Alignment Object.
 * @param {string} value
 * @returns {AlignmentObjectExtended} Alignment Object
 */
export const addScienceBranchObjectives = (value: string): AlignmentObjectExtended => {
  return {
    key: value.replace(/[\W_]+/g, '').trim().toLowerCase(),
    source: 'scienceBranchObjectives',
    alignmentType: 'teaches',
    targetName: value.trim(),
  };
};

/**
 * Converts string value to prerequisites Alignment Object.
 * @param {string} value
 * @returns {AlignmentObjectExtended} Alignment Object
 */
export const addPrerequisites = (value: string): AlignmentObjectExtended => {
  return {
    key: value.replace(/[\W_]+/g, '').trim().toLowerCase(),
    source: koodistoSources.prerequisites,
    alignmentType: 'requires',
    targetName: value.trim(),
  };
};

/**
 * Creates valid filename.
 * @param value {string} Original filename
 * @returns {string} Valid filename
 */
export function validateFilename(value: string): string {
  const validatedFilename = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s.\-_]/g, '')
    .replace(/\s/g, '_')
    .replace(/_+/g, '_')
    .replace(/-+/g, '-');

  return validatedFilename.length > 0
    ? validatedFilename
    : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Text input validator. Checks if there are any not allowed characters in description.
 * @returns {ValidatorFn}
 */
export function textInputValidator(): ValidatorFn {
  // tslint:disable-next-line:max-line-length
  const textInputRe: RegExp = /[^\wåäö\u0308\u030a\s.\-!'´`@#£€$%&()=?,:\u2012\u2013\u2014\u2015*\u2032\u2033\u2035\u2036\u301d\u301e\u02b9\u02ba\u2018\u2019\u201c\u201d\uff02]/i;

  return (control: AbstractControl): {[key: string]: any} | null => {
    const invalid = textInputRe.test(control.value);

    return invalid ? { 'invalidCharacters': { value: control.value } } : null;
  };
}

/**
 * Description validator. Checks if there are any not allowed characters in description.
 * @returns {ValidatorFn}
 */
export function descriptionValidator(): ValidatorFn {
  // tslint:disable-next-line:max-line-length
  const descriptionRe: RegExp = /[^\wåäö\u0308\u030a\s.\-§!'"´`@#£€$%&(){}=?+,;:\/\[\]\u2012\u2013\u2014\u2015*\u2032\u2033\u2035\u2036\u301d\u301e\u02b9\u02ba\u2018\u2019\u201c\u201d\uff02]/i;

  return (control: AbstractControl): {[key: string]: any} | null => {
    const invalid = descriptionRe.test(control.value);

    return invalid ? { 'invalid': { value: control.value } } : null;
  };
}

export function getValuesWithinLimits(input: any[], prop: string = 'value'): any[] {
  if (input.length <= 1) {
    return input;
  }

  const charLimit = 30;
  let usedChars = 0;
  const values = [];

  const [first, ...rest] = input;

  values.push(first);
  usedChars += first[prop].length;

  rest.forEach((row: any) => {
    if (usedChars + row[prop].length <= charLimit) {
      values.push(row);
      usedChars += row[prop].length;
    }
  });

  return values;
}
