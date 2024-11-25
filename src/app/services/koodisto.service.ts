import { Injectable } from '@angular/core';
import { KeyValue } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { Language } from '@models/koodisto/language';
import { LearningResourceType } from '@models/koodisto/learning-resource-type';
import { EducationalRole } from '@models/koodisto/educational-role';
import { EducationalUse } from '@models/koodisto/educational-use';
import { EducationalLevel, EducationalLevelChild } from '@models/koodisto/educational-level';
import { AlignmentObjectExtended } from '@models/alignment-object-extended';
import { AccessibilityFeature } from '@models/koodisto/accessibility-feature';
import { AccessibilityHazard } from '@models/koodisto/accessibility-hazard';
import { License } from '@models/koodisto/license';
import { environment } from '@environments/environment';
import { SubjectFilter } from '@models/koodisto/subject-filter';
import { catchError, map } from 'rxjs/operators';
import { EducationalSubject } from '@models/koodisto/educational-subject';

@Injectable({
  providedIn: 'root',
})
export class KoodistoService {
  apiUri: string = environment.koodistoUrl;
  lang: string;
  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
  };
  public learningResourceTypes$ = new Subject<LearningResourceType[]>();
  public educationalRoles$ = new Subject<EducationalRole[]>();
  public educationalUses$ = new Subject<EducationalUse[]>();
  public educationalLevels$ = new Subject<EducationalLevel[]>();
  public educationalLevelsEnabled$ = new Subject<EducationalLevel[]>();
  public basicStudySubjects$ = new Subject<AlignmentObjectExtended[]>();
  public basicStudyObjectives$ = new Subject<AlignmentObjectExtended[]>();
  public basicStudyContents$ = new Subject<AlignmentObjectExtended[]>();
  public preparatorySubjects$ = new Subject<AlignmentObjectExtended[]>();
  public preparatoryObjectives$ = new Subject<AlignmentObjectExtended[]>();
  public upperSecondarySchoolSubjectsOld$ = new Subject<AlignmentObjectExtended[]>();
  public upperSecondarySchoolCoursesOld$ = new Subject<AlignmentObjectExtended[]>();
  public upperSecondarySchoolSubjectsNew$ = new Subject<AlignmentObjectExtended[]>();
  public upperSecondarySchoolModulesNew$ = new Subject<AlignmentObjectExtended[]>();
  public upperSecondarySchoolObjectivesNew$ = new Subject<AlignmentObjectExtended[]>();
  public upperSecondarySchoolContentsNew$ = new Subject<AlignmentObjectExtended[]>();
  public vocationalDegrees$ = new Subject<AlignmentObjectExtended[]>();
  public vocationalUnits$ = new Subject<AlignmentObjectExtended[]>();
  public vocationalCommonUnits$ = new Subject<AlignmentObjectExtended[]>();
  public vocationalRequirements$ = new Subject<AlignmentObjectExtended[]>();
  public furtherVocationalQualifications$ = new Subject<AlignmentObjectExtended[]>();
  public specialistVocationalQualifications$ = new Subject<AlignmentObjectExtended[]>();
  public scienceBranches$ = new Subject<AlignmentObjectExtended[]>();
  public accessibilityFeatures$ = new Subject<AccessibilityFeature[]>();
  public accessibilityHazards$ = new Subject<AccessibilityHazard[]>();
  public keywords$ = new Subject<KeyValue<string, string>[]>();
  public organizations$ = new Subject<KeyValue<string, string>[]>();
  public educationalSubject$ = new Subject<SubjectFilter[]>();

  private languagesBehaviorSubject: BehaviorSubject<Language[]> = new BehaviorSubject<Language[]>([]);
  private licenses$$: BehaviorSubject<License[] | null> = new BehaviorSubject<License[] | null>(null);

  public languages$: Observable<Language[]> = this.languagesBehaviorSubject.asObservable();
  public licenses$: Observable<License[] | null> = this.licenses$$.asObservable();

  constructor(private http: HttpClient, private translate: TranslateService) {
    this.lang = this.translate.currentLang;
  }

  private handleError = (error: HttpErrorResponse, subject$: Subject<any>): Observable<never> => {
    switch (error.status) {
      case 404:
        subject$.next([]);
        return throwError('Resource not found; please try again later.');
      default:
        console.error(error);
        return throwError('Something bad happened; please try again later.');
    }
  };

  /**
   * Updates languages.
   */
  updateLanguages(): void {
    const lang: string = this.translate.currentLang;
    this.http.get<Language[]>(`${this.apiUri}/kielet/${lang}`, this.httpOptions).subscribe(
      (languages: Language[]): void => {
        this.languagesBehaviorSubject.next(languages);
      },
      (error: HttpErrorResponse) => this.handleError(error, this.languagesBehaviorSubject),
    );
  }

  /**
   * Updates learning resource types.
   */
  updateLearningResourceTypes(): void {
    const lang = this.translate.currentLang;

    this.http.get<LearningResourceType[]>(`${this.apiUri}/oppimateriaalityypit/${lang}`, this.httpOptions).subscribe(
      (learningResourceTypes: LearningResourceType[]) => {
        this.learningResourceTypes$.next(learningResourceTypes);
      },
      (error: HttpErrorResponse) => this.handleError(error, this.learningResourceTypes$),
    );
  }

  /**
   * Updates educational roles.
   */
  updateEducationalRoles(): void {
    const lang = this.translate.currentLang;

    this.http.get<EducationalRole[]>(`${this.apiUri}/kohderyhmat/${lang}`, this.httpOptions).subscribe(
      (educationalRoles: EducationalRole[]) => {
        this.educationalRoles$.next(educationalRoles);
      },
      (error: HttpErrorResponse) => this.handleError(error, this.educationalRoles$),
    );
  }

  /**
   * Updates educational uses.
   */
  updateEducationalUses(): void {
    const lang = this.translate.currentLang;

    this.http.get<EducationalUse[]>(`${this.apiUri}/kayttokohteet/${lang}`, this.httpOptions).subscribe(
      (educationalUses: EducationalUse[]) => {
        this.educationalUses$.next(educationalUses);
      },
      (error: HttpErrorResponse) => this.handleError(error, this.educationalUses$),
    );
  }

  /**
   * Updates educational levels.
   */
  updateEducationalLevels(): void {
    const lang = this.translate.currentLang;

    this.http.get<EducationalLevel[]>(`${this.apiUri}/koulutusasteet/${lang}`, this.httpOptions).subscribe(
      (educationalLevels: EducationalLevel[]) => {
        this.educationalLevels$.next(educationalLevels);
        this.educationalLevelsEnabled$.next(
          educationalLevels.map((level: EducationalLevel) => ({
            ...level,
            children: level.children.map((child: EducationalLevelChild) => ({
              ...child,
              disabled: false,
            })),
          })),
        );
      },
      (error: HttpErrorResponse) => this.handleError(error, this.educationalLevels$),
    );
  }

  /**
   * Updates basic study subjects.
   */
  updateBasicStudySubjects(): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/oppiaineet/${lang}`, this.httpOptions).subscribe(
      (basicStudySubjects: AlignmentObjectExtended[]) => {
        this.basicStudySubjects$.next(basicStudySubjects);
      },
      (error: HttpErrorResponse) => this.handleError(error, this.basicStudySubjects$),
    );
  }

  /**
   * Updates basic study objectives.
   * @param {string} ids
   */
  updateBasicStudyObjectives(ids: string): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/tavoitteet/${ids}/${lang}`, this.httpOptions).subscribe(
      (basicStudyObjectives: AlignmentObjectExtended[]) => {
        this.basicStudyObjectives$.next(basicStudyObjectives);
      },
      (error: HttpErrorResponse) => this.handleError(error, this.basicStudyObjectives$),
    );
  }

  /**
   * Updates basic study contents.
   * @param {string} ids
   */
  updateBasicStudyContents(ids: string): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/sisaltoalueet/${ids}/${lang}`, this.httpOptions).subscribe(
      (basicStudyContents: AlignmentObjectExtended[]) => {
        this.basicStudyContents$.next(basicStudyContents);
      },
      (error: HttpErrorResponse) => this.handleError(error, this.basicStudyContents$),
    );
  }

  /**
   * Updates preparatory education subjects.
   */
  updatePreparatorySubjects(): void {
    const lang = this.translate.currentLang;
    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/tuva-oppiaineet/${lang}`, this.httpOptions).subscribe(
      (preparatorySubjects: AlignmentObjectExtended[]) => {
        this.preparatorySubjects$.next(preparatorySubjects);
      },
      (error: HttpErrorResponse) => this.handleError(error, this.preparatorySubjects$),
    );
  }

  /**
   * Updates preparatory education objectives.
   * @param {string} ids
   */
  updatePreparatoryObjectives(ids: string): void {
    const lang = this.translate.currentLang;

    this.http
      .get<AlignmentObjectExtended[]>(`${this.apiUri}/tuva-tavoitteet/${ids}/${lang}`, this.httpOptions)
      .subscribe(
        (preparatoryObjectives: AlignmentObjectExtended[]) => {
          this.preparatoryObjectives$.next(preparatoryObjectives);
        },
        (error: HttpErrorResponse) => this.handleError(error, this.preparatoryObjectives$),
      );
  }

  /**
   * Updates upper secondary school subjects (old).
   */
  updateUpperSecondarySchoolSubjectsOld(): void {
    const lang = this.translate.currentLang;

    this.http
      .get<AlignmentObjectExtended[]>(`${this.apiUri}/lukio-vanha-oppiaineet/${lang}`, this.httpOptions)
      .subscribe(
        (subjects: AlignmentObjectExtended[]) => {
          this.upperSecondarySchoolSubjectsOld$.next(subjects);
        },
        (error: HttpErrorResponse) => this.handleError(error, this.upperSecondarySchoolSubjectsOld$),
      );
  }

  /**
   * Updates upper secondary school courses (old).
   * @param {string} ids
   */
  updateUpperSecondarySchoolCoursesOld(ids: string): void {
    const lang = this.translate.currentLang;

    this.http
      .get<AlignmentObjectExtended[]>(`${this.apiUri}/lukio-vanha-kurssit/${ids}/${lang}`, this.httpOptions)
      .subscribe(
        (subjects: AlignmentObjectExtended[]) => {
          this.upperSecondarySchoolCoursesOld$.next(subjects);
        },
        (error: HttpErrorResponse) => this.handleError(error, this.upperSecondarySchoolCoursesOld$),
      );
  }

  /**
   * Updates upper secondary school subjects (new).
   */
  updateUpperSecondarySchoolSubjectsNew(): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/lukio-oppiaineet/${lang}`, this.httpOptions).subscribe(
      (subjects: AlignmentObjectExtended[]) => {
        this.upperSecondarySchoolSubjectsNew$.next(subjects);
      },
      (error: HttpErrorResponse) => this.handleError(error, this.upperSecondarySchoolSubjectsNew$),
    );
  }

  /**
   * Updates upper secondary school modules (new).
   * @param {string} ids
   */
  updateUpperSecondarySchoolModulesNew(ids: string): void {
    const lang = this.translate.currentLang;

    this.http
      .get<AlignmentObjectExtended[]>(`${this.apiUri}/lukio-moduulit/${ids}/${lang}`, this.httpOptions)
      .subscribe(
        (modules: AlignmentObjectExtended[]) => {
          this.upperSecondarySchoolModulesNew$.next(modules);
        },
        (error: HttpErrorResponse) => this.handleError(error, this.upperSecondarySchoolModulesNew$),
      );
  }

  /**
   * Updates upper secondary school objectives (new).
   * @param {string} ids
   */
  updateUpperSecondarySchoolObjectivesNew(ids: string): void {
    const lang = this.translate.currentLang;

    this.http
      .get<AlignmentObjectExtended[]>(`${this.apiUri}/lukio-tavoitteet/${ids}/${lang}`, this.httpOptions)
      .subscribe(
        (objectives: AlignmentObjectExtended[]) => {
          this.upperSecondarySchoolObjectivesNew$.next(objectives);
        },
        (error: HttpErrorResponse) => this.handleError(error, this.upperSecondarySchoolObjectivesNew$),
      );
  }

  /**
   * Updates upper secondary school contents (new).
   * @param {string} ids
   */
  updateUpperSecondarySchoolContentsNew(ids: string): void {
    const lang = this.translate.currentLang;

    this.http
      .get<AlignmentObjectExtended[]>(`${this.apiUri}/lukio-sisallot/${ids}/${lang}`, this.httpOptions)
      .subscribe(
        (contents: AlignmentObjectExtended[]) => {
          this.upperSecondarySchoolContentsNew$.next(contents);
        },
        (error: HttpErrorResponse) => this.handleError(error, this.upperSecondarySchoolContentsNew$),
      );
  }

  /**
   * Updates vocational degrees.
   */
  updateVocationalDegrees(): void {
    const lang = this.translate.currentLang;

    this.http
      .get<AlignmentObjectExtended[]>(`${this.apiUri}/ammattikoulu-tutkinnot/${lang}`, this.httpOptions)
      .subscribe(
        (vocationalDegrees: AlignmentObjectExtended[]) => {
          this.vocationalDegrees$.next(vocationalDegrees);
        },
        (error: HttpErrorResponse) => this.handleError(error, this.vocationalDegrees$),
      );
  }

  /**
   * Updates vocational units.
   * @param {string} ids
   */
  updateVocationalUnits(ids: string): void {
    const lang = this.translate.currentLang;

    this.http
      .get<AlignmentObjectExtended[]>(`${this.apiUri}/ammattikoulu-tutkinnon-osat/${ids}/${lang}`, this.httpOptions)
      .subscribe(
        (vocationalUnits: AlignmentObjectExtended[]) => {
          this.vocationalUnits$.next(vocationalUnits);
        },
        (error: HttpErrorResponse) => this.handleError(error, this.vocationalUnits$),
      );
  }

  /**
   * Updates Vocational Common Units.
   */
  updateVocationalCommonUnits(): void {
    const lang = this.translate.currentLang;

    this.http
      .get<AlignmentObjectExtended[]>(`${this.apiUri}/ammattikoulu-yto-aineet/${lang}`, this.httpOptions)
      .subscribe(
        (vocationalCommonUnits: AlignmentObjectExtended[]) => {
          this.vocationalCommonUnits$.next(vocationalCommonUnits);
        },
        (error: HttpErrorResponse) => this.handleError(error, this.vocationalCommonUnits$),
      );
  }

  /**
   * Updates vocational requirements.
   * @param {string} ids
   */
  updateVocationalRequirements(ids: string): void {
    const lang = this.translate.currentLang;

    this.http
      .get<AlignmentObjectExtended[]>(`${this.apiUri}/ammattikoulu-vaatimukset/${ids}/${lang}`, this.httpOptions)
      .subscribe(
        (requirements: AlignmentObjectExtended[]) => {
          this.vocationalRequirements$.next(requirements);
        },
        (error: HttpErrorResponse) => this.handleError(error, this.vocationalRequirements$),
      );
  }

  /**
   * Updates further vocational qualifications.
   */
  updateFurtherVocationalQualifications(): void {
    this.http
      .get<AlignmentObjectExtended[]>(
        `${environment.koodistoUrl}/ammattikoulu-ammattitutkinnot/${this.lang}`,
        this.httpOptions,
      )
      .subscribe(
        (qualifications: AlignmentObjectExtended[]) => {
          this.furtherVocationalQualifications$.next(qualifications);
        },
        (error: HttpErrorResponse) => this.handleError(error, this.furtherVocationalQualifications$),
      );
  }

  /**
   * Updates specialist vocational qualifications.
   */
  updateSpecialistVocationalQualifications(): void {
    this.http
      .get<AlignmentObjectExtended[]>(
        `${environment.koodistoUrl}/ammattikoulu-erikoisammattitutkinnot/${this.lang}`,
        this.httpOptions,
      )
      .subscribe(
        (qualifications: AlignmentObjectExtended[]) => {
          this.specialistVocationalQualifications$.next(qualifications);
        },
        (error: HttpErrorResponse) => this.handleError(error, this.specialistVocationalQualifications$),
      );
  }

  /**
   * Updates science branches.
   */
  updateScienceBranches(): void {
    const lang = this.translate.currentLang;

    this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/tieteenalat/${lang}`, this.httpOptions).subscribe(
      (scienceBranches: AlignmentObjectExtended[]) => {
        this.scienceBranches$.next(scienceBranches);
      },
      (error: HttpErrorResponse) => this.handleError(error, this.scienceBranches$),
    );
  }

  /**
   * Updates accessibility features.
   */
  updateAccessibilityFeatures(): void {
    const lang = this.translate.currentLang;

    this.http
      .get<AccessibilityFeature[]>(`${this.apiUri}/saavutettavuudentukitoiminnot/${lang}`, this.httpOptions)
      .subscribe(
        (accessibilityFeatures: AccessibilityFeature[]) => {
          this.accessibilityFeatures$.next(accessibilityFeatures);
        },
        (error: HttpErrorResponse) => this.handleError(error, this.accessibilityFeatures$),
      );
  }

  /**
   * Updates accessibility hazards.
   */
  updateAccessibilityHazards(): void {
    const lang = this.translate.currentLang;

    this.http.get<AccessibilityHazard[]>(`${this.apiUri}/saavutettavuudenesteet/${lang}`, this.httpOptions).subscribe(
      (accessibilityHazards: AccessibilityHazard[]) => {
        this.accessibilityHazards$.next(accessibilityHazards);
      },
      (error: HttpErrorResponse) => this.handleError(error, this.accessibilityHazards$),
    );
  }

  /**
   * Updates licenses.
   */
  updateLicenses(selectedLanguage?: string): Observable<void> {
    const lang: string = selectedLanguage || this.translate.currentLang;
    return this.http.get<License[]>(`${this.apiUri}/lisenssit/${lang}`).pipe(
      map((licenses: License[]): void => {
        const extendedLicenses = licenses.map((license: License) => ({ ...license, isCollapsed: true }));
        this.licenses$$.next(extendedLicenses);
      }),
      catchError((err) => this.handleError(err, this.licenses$$)),
    );
  }

  /**
   * Updates keywords.
   */
  updateKeywords(): void {
    const lang = this.translate.currentLang;

    this.http.get<KeyValue<string, string>[]>(`${this.apiUri}/asiasanat/${lang}`, this.httpOptions).subscribe(
      (keywords: KeyValue<string, string>[]) => {
        this.keywords$.next(keywords);
      },
      (error: HttpErrorResponse) => this.handleError(error, this.keywords$),
    );
  }

  /**
   * Updates organizations.
   */
  updateOrganizations(): void {
    const lang = this.translate.currentLang;

    this.http.get<KeyValue<string, string>[]>(`${this.apiUri}/organisaatiot/${lang}`, this.httpOptions).subscribe(
      (organizations: KeyValue<string, string>[]) => {
        this.organizations$.next(organizations);
      },
      (error: HttpErrorResponse) => this.handleError(error, this.organizations$),
    );
  }

  /**
   * Updates educational subject filters.
   */
  updateEducationalSubjects(): void {
    const lang: string = this.translate.currentLang;
    this.http
      .get<SubjectFilter[]>(`${this.apiUri}/filters-oppiaineet-tieteenalat-tutkinnot/${lang}`, this.httpOptions)
      .subscribe(
        (educationalSubjects: EducationalSubject[]): void => {
          const educationalSubjectsWithoutNulls: EducationalSubject[] = educationalSubjects.filter(
            (educationalSubject: EducationalSubject): boolean => educationalSubject !== null,
          );
          this.educationalSubject$.next(educationalSubjectsWithoutNulls);
        },
        (error: HttpErrorResponse) => this.handleError(error, this.educationalSubject$),
      );
  }
}
