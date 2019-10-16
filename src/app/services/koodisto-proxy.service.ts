import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { Language } from '../models/koodisto-proxy/language';
import { LearningResourceType } from '../models/koodisto-proxy/learning-resource-type';
import { EducationalRole } from '../models/koodisto-proxy/educational-role';
import { EducationalUse } from '../models/koodisto-proxy/educational-use';
import { EducationalLevel } from '../models/koodisto-proxy/educational-level';
import { AlignmentObjectExtended } from '../models/alignment-object-extended';

@Injectable({
  providedIn: 'root'
})
export class KoodistoProxyService {
  apiUri = 'https://koodisto.aoe.fi/api/v1';

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }),
  };

  public languages$ = new Subject<Language[]>();
  public defaultLanguage$ = new Subject<Language>();
  public learningResourceTypes$ = new Subject<LearningResourceType[]>();
  public educationalRoles$ = new Subject<EducationalRole[]>();
  public educationalUses$ = new Subject<EducationalUse[]>();
  public educationalLevels$ = new Subject<EducationalLevel[]>();
  public basicStudySubjects$ = new Subject<AlignmentObjectExtended[]>();
  public upperSecondarySchoolSubjects$ = new Subject<AlignmentObjectExtended[]>();
  public vocationalDegrees$ = new Subject<AlignmentObjectExtended[]>();
  public scienceBranches$ = new Subject<AlignmentObjectExtended[]>();

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
  ) { }

  /**
   * Returns data from koodisto-service by rediskey and language.
   * @param {string} rediskey
   * @param {string} lang
   */
  getData(rediskey: string, lang: string): Observable<any> {
    return this.http.get(`${this.apiUri}/${rediskey}/${lang}`, this.httpOptions);
  }

  updateLanguages(): void {
    const lang = this.translate.currentLang;

    this.http.get<Language[]>(`${this.apiUri}/kielet/${lang}`, this.httpOptions)
      .subscribe((languages: Language[]) => {
        this.languages$.next(languages);
      });
  }

  updateDefaultLanguage(): void {
    const lang = this.translate.currentLang;

    this.http.get<Language>(`${this.apiUri}/kielet/${lang.toUpperCase()}/${lang}`, this.httpOptions)
      .subscribe((defaultLanguage: Language) => {
        this.defaultLanguage$.next(defaultLanguage);
      });
  }

  updateLearningResourceTypes(): void {
    const lang = this.translate.currentLang;

    this.http.get<LearningResourceType[]>(`${this.apiUri}/oppimateriaalityypit/${lang}`, this.httpOptions)
      .subscribe((learningResourceTypes: LearningResourceType[]) => {
        this.learningResourceTypes$.next(learningResourceTypes);
      });
  }

  updateEducationalRoles(): void {
    const lang = this.translate.currentLang;

    this.http.get<EducationalRole[]>(`${this.apiUri}/kohderyhmat/${lang}`, this.httpOptions)
      .subscribe((educationalRoles: EducationalRole[]) => {
        this.educationalRoles$.next(educationalRoles);
      });
  }

  updateEducationalUses(): void {
    const lang = this.translate.currentLang;

    this.http.get<EducationalUse[]>(`${this.apiUri}/kayttokohteet/${lang}`, this.httpOptions)
      .subscribe((educationalUses: EducationalUse[]) => {
        this.educationalUses$.next(educationalUses);
      });
  }

  updateEducationalLevels(): void {
    const lang = this.translate.currentLang;

    this.http.get<EducationalLevel[]>(`${this.apiUri}/koulutusasteet/${lang}`, this.httpOptions)
      .subscribe((educationalLevels: EducationalLevel[]) => {
        this.educationalLevels$.next(educationalLevels);
      });
  }

  updateBasicStudySubjects(): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/oppiaineet/${lang}`, this.httpOptions)
      .subscribe((basicStudySubjects: AlignmentObjectExtended[]) => {
        this.basicStudySubjects$.next(basicStudySubjects);
      });
  }

  updateUpperSecondarySchoolSubjects(): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/lukionkurssit/${lang}`, this.httpOptions)
      .subscribe((upperSecondarySchoolSubjects: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolSubjects$.next(upperSecondarySchoolSubjects);
      });
  }

  updateVocationalDegrees(): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/ammatillisentutkinnot/${lang}`, this.httpOptions)
      .subscribe((vocationalDegrees: AlignmentObjectExtended[]) => {
        this.vocationalDegrees$.next(vocationalDegrees);
      });
  }

  updateScienceBranches(): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/tieteenalat/${lang}`, this.httpOptions)
      .subscribe((scienceBranches: AlignmentObjectExtended[]) => {
        this.scienceBranches$.next(scienceBranches);
      });
  }
}
