import { Injectable } from '@angular/core';
import { KeyValue } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { Language } from '../models/koodisto-proxy/language';
import { LearningResourceType } from '../models/koodisto-proxy/learning-resource-type';
import { EducationalRole } from '../models/koodisto-proxy/educational-role';
import { EducationalUse } from '../models/koodisto-proxy/educational-use';
import { EducationalLevel } from '../models/koodisto-proxy/educational-level';
import { AlignmentObjectExtended } from '../models/alignment-object-extended';
import { AccessibilityFeature } from '../models/koodisto-proxy/accessibility-feature';
import { AccessibilityHazard } from '../models/koodisto-proxy/accessibility-hazard';
import { License } from '../models/koodisto-proxy/license';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KoodistoProxyService {
  apiUri = environment.koodistoUrl;

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }),
  };

  public languages$ = new Subject<Language[]>();
  public learningResourceTypes$ = new Subject<LearningResourceType[]>();
  public educationalRoles$ = new Subject<EducationalRole[]>();
  public educationalUses$ = new Subject<EducationalUse[]>();
  public educationalLevels$ = new Subject<EducationalLevel[]>();
  public basicStudySubjects$ = new Subject<AlignmentObjectExtended[]>();
  public basicStudyObjectives$ = new Subject<AlignmentObjectExtended[]>();
  public basicStudyContents$ = new Subject<AlignmentObjectExtended[]>();
  public upperSecondarySchoolSubjects$ = new Subject<AlignmentObjectExtended[]>();
  public vocationalDegrees$ = new Subject<AlignmentObjectExtended[]>();
  public scienceBranches$ = new Subject<AlignmentObjectExtended[]>();
  public accessibilityFeatures$ = new Subject<AccessibilityFeature[]>();
  public accessibilityHazards$ = new Subject<AccessibilityHazard[]>();
  public licenses$ = new Subject<License[]>();
  public keywords$ = new Subject<KeyValue<string, string>[]>();
  public organizations$ = new Subject<KeyValue<string, string>[]>();

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
  ) { }

  /**
   * Updates languages.
   */
  updateLanguages(): void {
    const lang = this.translate.currentLang;

    this.http.get<Language[]>(`${this.apiUri}/kielet/${lang}`, this.httpOptions)
      .subscribe((languages: Language[]) => {
        this.languages$.next(languages);
      });
  }

  /**
   * Updates learning resource types.
   */
  updateLearningResourceTypes(): void {
    const lang = this.translate.currentLang;

    this.http.get<LearningResourceType[]>(`${this.apiUri}/oppimateriaalityypit/${lang}`, this.httpOptions)
      .subscribe((learningResourceTypes: LearningResourceType[]) => {
        this.learningResourceTypes$.next(learningResourceTypes);
      });
  }

  /**
   * Updates educational roles.
   */
  updateEducationalRoles(): void {
    const lang = this.translate.currentLang;

    this.http.get<EducationalRole[]>(`${this.apiUri}/kohderyhmat/${lang}`, this.httpOptions)
      .subscribe((educationalRoles: EducationalRole[]) => {
        this.educationalRoles$.next(educationalRoles);
      });
  }

  /**
   * Updates educational uses.
   */
  updateEducationalUses(): void {
    const lang = this.translate.currentLang;

    this.http.get<EducationalUse[]>(`${this.apiUri}/kayttokohteet/${lang}`, this.httpOptions)
      .subscribe((educationalUses: EducationalUse[]) => {
        this.educationalUses$.next(educationalUses);
      });
  }

  /**
   * Updates educational levels.
   */
  updateEducationalLevels(): void {
    const lang = this.translate.currentLang;

    this.http.get<EducationalLevel[]>(`${this.apiUri}/koulutusasteet/${lang}`, this.httpOptions)
      .subscribe((educationalLevels: EducationalLevel[]) => {
        this.educationalLevels$.next(educationalLevels);
      });
  }

  /**
   * Updates basic study subjects.
   */
  updateBasicStudySubjects(): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/oppiaineet/${lang}`, this.httpOptions)
      .subscribe((basicStudySubjects: AlignmentObjectExtended[]) => {
        this.basicStudySubjects$.next(basicStudySubjects);
      });
  }

  /**
   * Updates basic study objectives.
   * @param {string} ids
   */
  updateBasicStudyObjectives(ids: string): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/tavoitteet/${ids}/${lang}`, this.httpOptions)
      .subscribe((basicStudyObjectives: AlignmentObjectExtended[]) => {
        this.basicStudyObjectives$.next(basicStudyObjectives);
      });
  }

  /**
   * Updates basic study contents.
   * @param {string} ids
   */
  updateBasicStudyContents(ids: string): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/sisaltoalueet/${ids}/${lang}`, this.httpOptions)
      .subscribe((basicStudyContents: AlignmentObjectExtended[]) => {
        this.basicStudyContents$.next(basicStudyContents);
      });
  }

  /**
   * Updates upper secondary school subjects.
   */
  updateUpperSecondarySchoolSubjects(): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/lukionkurssit/${lang}`, this.httpOptions)
      .subscribe((upperSecondarySchoolSubjects: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolSubjects$.next(upperSecondarySchoolSubjects);
      });
  }

  /**
   * Updates vocational degrees.
   */
  updateVocationalDegrees(): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/ammatillisentutkinnot/${lang}`, this.httpOptions)
      .subscribe((vocationalDegrees: AlignmentObjectExtended[]) => {
        this.vocationalDegrees$.next(vocationalDegrees);
      });
  }

  /**
   * Updates science branches.
   */
  updateScienceBranches(): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/tieteenalat/${lang}`, this.httpOptions)
      .subscribe((scienceBranches: AlignmentObjectExtended[]) => {
        this.scienceBranches$.next(scienceBranches);
      });
  }

  /**
   * Updates accessibility features.
   */
  updateAccessibilityFeatures(): void {
    const lang = this.translate.currentLang;

    this.http.get<AccessibilityFeature[]>(`${this.apiUri}/saavutettavuudentukitoiminnot/${lang}`, this.httpOptions)
      .subscribe((accessibilityFeatures: AccessibilityFeature[]) => {
        this.accessibilityFeatures$.next(accessibilityFeatures);
      });
  }

  /**
   * Updates accessibility hazards.
   */
  updateAccessibilityHazards(): void {
    const lang = this.translate.currentLang;

    this.http.get<AccessibilityHazard[]>(`${this.apiUri}/saavutettavuudenesteet/${lang}`, this.httpOptions)
      .subscribe((accessibilityHazards: AccessibilityHazard[]) => {
        this.accessibilityHazards$.next(accessibilityHazards);
      });
  }

  /**
   * Updates licenses.
   */
  updateLicenses(): void {
    const lang = this.translate.currentLang;

    this.http.get<License[]>(`${this.apiUri}/lisenssit/${lang}`, this.httpOptions)
      .subscribe((licenses: License[]) => {
        this.licenses$.next(licenses.map(license => ({ ...license, isCollapsed: true })));
      });
  }

  /**
   * Updates keywords.
   */
  updateKeywords(): void {
    const lang = this.translate.currentLang;

    this.http.get<KeyValue<string, string>[]>(`${this.apiUri}/asiasanat/${lang}`, this.httpOptions)
      .subscribe((keywords: KeyValue<string, string>[]) => {
        this.keywords$.next(keywords);
      });
  }

  /**
   * Updates organizations.
   */
  updateOrganizations(): void {
    const lang = this.translate.currentLang;

    this.http.get<KeyValue<string, string>[]>(`${this.apiUri}/organisaatiot/${lang}`, this.httpOptions)
      .subscribe((organizations: KeyValue<string, string>[]) => {
        this.organizations$.next(organizations);
      });
  }
}
