import { Injectable } from '@angular/core';
import { KeyValue } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { EducationalLevel, SubjectFilter } from '../model';
import { environment } from '../../../environments/environment';

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
  private educationalLevelsBehaviorSubject = new BehaviorSubject<EducationalLevel[]>(null);
  private organizationsBehaviorSubject = new BehaviorSubject<KeyValue<string, string>[]>(null);
  private subjectFiltersBehaviorSubject = new BehaviorSubject<SubjectFilter[]>(null);

  public educationalLevels$: Observable<EducationalLevel[]> = this.educationalLevelsBehaviorSubject.asObservable();
  public organizations$: Observable<KeyValue<string, string>[]> = this.organizationsBehaviorSubject.asObservable();
  public subjectFilters$: Observable<SubjectFilter[]> = this.subjectFiltersBehaviorSubject.asObservable();

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
   * Updates educational levels.
   */
  updateEducationalLevels(): void {
    const lang = this.translate.currentLang;

    this.http.get<EducationalLevel[]>(`${this.apiUri}/koulutusasteet/${lang}`, this.httpOptions).subscribe(
      (educationalLevels: EducationalLevel[]) => {
        this.educationalLevelsBehaviorSubject.next(educationalLevels);
      },
      (error: HttpErrorResponse) => this.handleError(error, this.educationalLevelsBehaviorSubject),
    );
  }

  /**
   * Updates organizations.
   */
  updateOrganizations(): void {
    const lang = this.translate.currentLang;

    this.http.get<KeyValue<string, string>[]>(`${this.apiUri}/organisaatiot/${lang}`, this.httpOptions).subscribe(
      (organizations: KeyValue<string, string>[]) => {
        this.organizationsBehaviorSubject.next(organizations);
      },
      (error: HttpErrorResponse) => this.handleError(error, this.organizationsBehaviorSubject),
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
          this.subjectFiltersBehaviorSubject.next(filters);
        },
        (error: HttpErrorResponse) => this.handleError(error, this.subjectFiltersBehaviorSubject),
      );
  }
}
