import { Injectable } from '@angular/core';
import { KeyValue } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { EducationalLevel, EducationalSubject, EducationalLevelChild } from '@admin/model';
import { environment } from '@environments/environment';
import { Organization } from '@admin/model/organization';
import { catchError, map, tap } from 'rxjs/operators';

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
  private educationalLevelsBehaviorSubject: BehaviorSubject<EducationalLevel[] | null> = new BehaviorSubject<
    EducationalLevel[] | null
  >(null);
  private educationalSubjectsBehaviorSubject: BehaviorSubject<EducationalSubject[] | null> = new BehaviorSubject<
    EducationalSubject[] | null
  >(null);
  private organizationsBehaviorSubject: BehaviorSubject<Organization[] | null> = new BehaviorSubject<
    Organization[] | null
  >(null);

  public educationalLevels$: Observable<EducationalLevel[] | null> =
    this.educationalLevelsBehaviorSubject.asObservable();
  public educationalSubjects$: Observable<EducationalSubject[] | null> =
    this.educationalSubjectsBehaviorSubject.asObservable();
  public organizations$: Observable<Organization[] | null> = this.organizationsBehaviorSubject.asObservable();

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

  updateEducationalLevels(): Observable<EducationalLevel[]> {
    // const lang: string = this.translate.currentLang;
    const lang = 'fi';
    return this.http.get<EducationalLevel[]>(`${this.apiUri}/koulutusasteet/${lang}`, this.httpOptions).pipe(
      map((educationalLevels: EducationalLevel[]) =>
        educationalLevels.filter((educationalLevel: EducationalLevel): boolean => educationalLevel !== null),
      ),
      tap((educationalLevels: EducationalLevel[]) =>
        this.educationalLevelsBehaviorSubject.next(
          educationalLevels.map((level: EducationalLevel) => ({
            ...level,
            children: level.children.map((child: EducationalLevelChild) => ({
              ...child,
              disabled: false,
            })),
          })),
        ),
      ),
      catchError((err: any) => of(err)),
    );
  }

  updateEducationalSubjects(): Observable<EducationalSubject[]> {
    // const lang: string = this.translate.currentLang;
    const lang = 'fi';
    return this.http
      .get<EducationalSubject[]>(`${this.apiUri}/filters-oppiaineet-tieteenalat-tutkinnot/${lang}`, this.httpOptions)
      .pipe(
        map((educationalSubjects: EducationalSubject[]) =>
          educationalSubjects.filter((educationalSubject: EducationalSubject): boolean => educationalSubject !== null),
        ),
        tap((educationalSubjects: EducationalSubject[]) =>
          this.educationalSubjectsBehaviorSubject.next(educationalSubjects),
        ),
        catchError((err: any) => of(err)),
      );
  }

  updateOrganizations(): void {
    const lang: string = this.translate.currentLang;
    this.http.get<KeyValue<string, string>[]>(`${this.apiUri}/organisaatiot/${lang}`, this.httpOptions).subscribe(
      (organizations: Organization[]): void => {
        this.organizationsBehaviorSubject.next(organizations);
      },
      (error: HttpErrorResponse) => this.handleError(error, this.organizationsBehaviorSubject),
    );
  }
}
