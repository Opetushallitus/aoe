import { Injectable } from '@angular/core';
import { KeyValue } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { Language } from '@models/koodisto/language';
import { LearningResourceType } from '@models/koodisto/learning-resource-type';
import { EducationalRole } from '@models/koodisto/educational-role';
import { EducationalUse } from '@models/koodisto/educational-use';
import { EducationalLevel } from '@models/koodisto/educational-level';
import { AlignmentObjectExtended } from '@models/alignment-object-extended';
import { AccessibilityFeature } from '@models/koodisto/accessibility-feature';
import { AccessibilityHazard } from '@models/koodisto/accessibility-hazard';
import { License } from '@models/koodisto/license';
import { environment } from '../../environments/environment';
import { SubjectFilter } from '@models/koodisto/subject-filter';

@Injectable({
    providedIn: 'root',
})
export class KoodistoService {
    apiUri = environment.koodistoUrl;
    lang: string;
    httpOptions = {
        headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }),
    };
    public learningResourceTypes$ = new Subject<LearningResourceType[]>();
    public educationalRoles$ = new Subject<EducationalRole[]>();
    public educationalUses$ = new Subject<EducationalUse[]>();
    public educationalLevels$ = new Subject<EducationalLevel[]>();
    public basicStudySubjects$ = new Subject<AlignmentObjectExtended[]>();
    public basicStudyObjectives$ = new Subject<AlignmentObjectExtended[]>();
    public basicStudyContents$ = new Subject<AlignmentObjectExtended[]>();
    public upperSecondarySchoolSubjects$ = new Subject<AlignmentObjectExtended[]>();
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
    public licenses$ = new Subject<License[]>();
    public keywords$ = new Subject<KeyValue<string, string>[]>();
    public organizations$ = new Subject<KeyValue<string, string>[]>();
    public subjectFilters$ = new Subject<SubjectFilter[]>();

    private languagesBehaviorSubject = new BehaviorSubject<Language[]>([]);

    public languages$ = this.languagesBehaviorSubject.asObservable();

    constructor(private http: HttpClient, private translate: TranslateService) {
        this.lang = this.translate.currentLang;
    }

    private handleError = (error: HttpErrorResponse, subject$: Subject<any>): Observable<never> => {
        switch (error.status) {
            case 404:
                subject$.next([]);
                break;

            default:
                console.error(error);
                return throwError('Something bad happened; please try again later.');
        }
    };

    /**
     * Updates languages.
     */
    updateLanguages(): void {
        const lang = this.translate.currentLang;

        this.http.get<Language[]>(`${this.apiUri}/kielet/${lang}`, this.httpOptions).subscribe(
            (languages: Language[]) => {
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

        this.http
            .get<LearningResourceType[]>(`${this.apiUri}/oppimateriaalityypit/${lang}`, this.httpOptions)
            .subscribe(
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

        this.http
            .get<AlignmentObjectExtended[]>(`${this.apiUri}/tavoitteet/${ids}/${lang}`, this.httpOptions)
            .subscribe(
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

        this.http
            .get<AlignmentObjectExtended[]>(`${this.apiUri}/sisaltoalueet/${ids}/${lang}`, this.httpOptions)
            .subscribe(
                (basicStudyContents: AlignmentObjectExtended[]) => {
                    this.basicStudyContents$.next(basicStudyContents);
                },
                (error: HttpErrorResponse) => this.handleError(error, this.basicStudyContents$),
            );
    }

    /**
     * Updates upper secondary school subjects.
     */
    updateUpperSecondarySchoolSubjects(): void {
        const lang = this.translate.currentLang;

        this.http.get<AlignmentObjectExtended[]>(`${this.apiUri}/lukionkurssit/${lang}`, this.httpOptions).subscribe(
            (upperSecondarySchoolSubjects: AlignmentObjectExtended[]) => {
                this.upperSecondarySchoolSubjects$.next(upperSecondarySchoolSubjects);
            },
            (error: HttpErrorResponse) => this.handleError(error, this.upperSecondarySchoolSubjects$),
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
            .get<AlignmentObjectExtended[]>(
                `${this.apiUri}/ammattikoulu-tutkinnon-osat/${ids}/${lang}`,
                this.httpOptions,
            )
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

        this.http
            .get<AccessibilityHazard[]>(`${this.apiUri}/saavutettavuudenesteet/${lang}`, this.httpOptions)
            .subscribe(
                (accessibilityHazards: AccessibilityHazard[]) => {
                    this.accessibilityHazards$.next(accessibilityHazards);
                },
                (error: HttpErrorResponse) => this.handleError(error, this.accessibilityHazards$),
            );
    }

    /**
     * Updates licenses.
     */
    updateLicenses(): void {
        const lang = this.translate.currentLang;

        this.http.get<License[]>(`${this.apiUri}/lisenssit/${lang}`, this.httpOptions).subscribe(
            (licenses: License[]) => {
                this.licenses$.next(licenses.map((license) => ({ ...license, isCollapsed: true })));
            },
            (error: HttpErrorResponse) => this.handleError(error, this.licenses$),
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
    updateSubjectFilters(): void {
        const lang = this.translate.currentLang;

        this.http
            .get<SubjectFilter[]>(`${this.apiUri}/filters-oppiaineet-tieteenalat-tutkinnot/${lang}`, this.httpOptions)
            .subscribe(
                (filters: SubjectFilter[]) => {
                    this.subjectFilters$.next(filters);
                },
                (error: HttpErrorResponse) => this.handleError(error, this.subjectFilters$),
            );
    }
}
