import { Injectable } from '@angular/core';
import { KeyValue } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { Language } from '@models/koodisto-proxy/language';
import { LearningResourceType } from '@models/koodisto-proxy/learning-resource-type';
import { EducationalRole } from '@models/koodisto-proxy/educational-role';
import { EducationalUse } from '@models/koodisto-proxy/educational-use';
import { EducationalLevel } from '@models/koodisto-proxy/educational-level';
import { AlignmentObjectExtended } from '@models/alignment-object-extended';
import { AccessibilityFeature } from '@models/koodisto-proxy/accessibility-feature';
import { AccessibilityHazard } from '@models/koodisto-proxy/accessibility-hazard';
import { License } from '@models/koodisto-proxy/license';
import { environment } from '../../environments/environment';
import { SubjectFilter } from '@models/koodisto-proxy/subject-filter';

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
  public upperSecondarySchoolSubjectsNew$ = new Subject<AlignmentObjectExtended[]>();
  public upperSecondarySchoolModulesNew$ = new Subject<AlignmentObjectExtended[]>();
  public upperSecondarySchoolObjectivesNew$ = new Subject<AlignmentObjectExtended[]>();
  public upperSecondarySchoolContentsNew$ = new Subject<AlignmentObjectExtended[]>();
  public vocationalDegrees$ = new Subject<AlignmentObjectExtended[]>();
  public vocationalUnits$ = new Subject<AlignmentObjectExtended[]>();
  public vocationalRequirements$ = new Subject<AlignmentObjectExtended[]>();
  public scienceBranches$ = new Subject<AlignmentObjectExtended[]>();
  public accessibilityFeatures$ = new Subject<AccessibilityFeature[]>();
  public accessibilityHazards$ = new Subject<AccessibilityHazard[]>();
  public licenses$ = new Subject<License[]>();
  public keywords$ = new Subject<KeyValue<string, string>[]>();
  public organizations$ = new Subject<KeyValue<string, string>[]>();
  public subjectFilters$ = new Subject<SubjectFilter[]>();

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
   * Updates upper secondary school subjects (new).
   */
  updateUpperSecondarySchoolSubjectsNew(): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/lukio-oppiaineet/${lang}`, this.httpOptions)
      .subscribe((subjects: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolSubjectsNew$.next(subjects);
      });
  }

  /**
   * Updates upper secondary school modules (new).
   * @param {string} ids
   */
  updateUpperSecondarySchoolModulesNew(ids: string): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/lukio-moduulit/${ids}/${lang}`, this.httpOptions)
      .subscribe(
        (modules: AlignmentObjectExtended[]) => {
          this.upperSecondarySchoolModulesNew$.next(modules);
        },
        () => {
          this.upperSecondarySchoolModulesNew$.next([]);
        },
      );
  }

  /**
   * Updates upper secondary school objectives (new).
   * @param {string} ids
   */
  updateUpperSecondarySchoolObjectivesNew(ids: string): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/lukio-tavoitteet/${ids}/${lang}`, this.httpOptions)
      .subscribe(
        (objectives: AlignmentObjectExtended[]) => {
          this.upperSecondarySchoolObjectivesNew$.next(objectives);
        },
        () => {
          this.upperSecondarySchoolObjectivesNew$.next([]);
        },
      );
  }

  /**
   * Updates upper secondary school contents (new).
   * @param {string} ids
   */
  updateUpperSecondarySchoolContentsNew(ids: string): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/lukio-sisallot/${ids}/${lang}`, this.httpOptions)
      .subscribe(
        (contents: AlignmentObjectExtended[]) => {
          this.upperSecondarySchoolContentsNew$.next(contents);
        },
        () => {
          this.upperSecondarySchoolContentsNew$.next([]);
        },
      );
  }

  /**
   * Updates vocational degrees.
   */
  updateVocationalDegrees(): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/ammattikoulu-tutkinnot/${lang}`, this.httpOptions)
      .subscribe((vocationalDegrees: AlignmentObjectExtended[]) => {
        this.vocationalDegrees$.next(vocationalDegrees);
      });
  }

  /**
   * Updates vocational units.
   * @param {string} ids
   */
  updateVocationalUnits(ids: string): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/ammattikoulu-tutkinnon-osat/${ids}/${lang}`, this.httpOptions)
      .subscribe(
        (vocationalUnits: AlignmentObjectExtended[]) => {
          this.vocationalUnits$.next(vocationalUnits);
        },
        () => {
          this.vocationalUnits$.next([]);
        },
      );
  }

  /**
   * Updates vocational requirements.
   * @param {string} ids
   */
  updateVocationalRequirements(ids: string): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/ammattikoulu-vaatimukset/${ids}/${lang}`, this.httpOptions)
      .subscribe(
        (requirements: AlignmentObjectExtended[]) => {
          this.vocationalRequirements$.next(requirements);
        },
        () => {
          this.vocationalRequirements$.next([]);
        },
      );
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

  /**
   * Updates educational subject filters.
   */
  updateSubjectFilters(): void {
    const lang = this.translate.currentLang;

    this.http.get<SubjectFilter[]>(`${this.apiUri}/filters-oppiaineet-tieteenalat-tutkinnot/${lang}`, this.httpOptions)
      .subscribe((filters: SubjectFilter[]) => {
        this.subjectFilters$.next(filters);
      });
  }
}
