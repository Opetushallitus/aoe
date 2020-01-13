import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, Subject, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { environment } from '../../environments/environment';
import { EducationalMaterial } from '../models/educational-material';
import { UploadMessage } from '../models/upload-message';
import { EducationalMaterialList } from '../models/educational-material-list';
import { AlignmentObjectExtended } from '../models/alignment-object-extended';
import { UploadedFile } from '../models/uploaded-file';
import { AuthService } from './auth.service';
import { koodistoSources } from '../constants/koodisto-sources';
import { Attachment } from '../models/backend/attachment';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  backendUrl = environment.backendUrl;
  private localStorageKey = environment.fileUploadLSKey;
  lang: string = this.translate.currentLang;

  public uploadedFiles$ = new Subject<UploadedFile[]>();

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private authSvc: AuthService,
  ) { }

  /**
   * Uploads files to backend.
   * @param {FormData} data
   * @returns {Observable<UploadMessage>} Upload message
   */
  uploadFiles(data: FormData): Observable<UploadMessage> {
    let uploadUrl: string;

    if (sessionStorage.getItem(this.localStorageKey) !== null) {
      const fileUpload = JSON.parse(sessionStorage.getItem(this.localStorageKey));

      uploadUrl = `${this.backendUrl}/material/file/${fileUpload.id}`;
    } else {
      uploadUrl = `${this.backendUrl}/material/file`;
    }

    return this.http.post<FormData>(uploadUrl, data, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
      reportProgress: true,
      observe: 'events',
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round(100 * event.loaded / event.total);
            return { status: 'progress', message: progress };

          case HttpEventType.Response:
            const fileUpload = JSON.parse(sessionStorage.getItem(this.localStorageKey));

            if (fileUpload !== null) {
              const response = {
                id: fileUpload.id,
              };

              sessionStorage.setItem(this.localStorageKey, JSON.stringify(response));
            } else {
              sessionStorage.setItem(this.localStorageKey, JSON.stringify(event.body));
            }

            return { status: 'completed', message: 'Upload completed', response: event.body };

          default:
            return { status: 'error', message: `Unhandled event: ${event.type}` };
        }
      }),
      catchError(this.handleError),
    );
  }

  uploadSubtitle(fileId: string, data: FormData): Observable<UploadMessage> {
    return this.http.post<FormData>(`${this.backendUrl}/material/attachment/${fileId}`, data, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
      reportProgress: true,
      observe: 'events',
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round(100 * event.loaded / event.total);
            return { status: 'progress', message: progress };

          case HttpEventType.Response:
            return { status: 'completed', message: 'Upload completed', response: event.body };

          default:
            return { status: 'error', message: `Unhandled event: ${event.type}` };
        }
      }),
      catchError(this.handleError),
    );
  }

  /**
   * Posts links to backend.
   * @param {number} materialId
   * @param {json} data
   */
  postLinks(data: any): Observable<any> {
    const fileUpload = JSON.parse(sessionStorage.getItem(this.localStorageKey));

    return this.http.post<any>(`${this.backendUrl}/material/link/${fileUpload.id}`, data, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).pipe(
      catchError(this.handleError),
    );
  }

  /**
   * Posts meta data to backend by material ID.
   * @param {number} materialId
   * @param {any} data
   */
  postMeta(materialId: number, data: any) {
    const uploadUrl = `${this.backendUrl}/material/${materialId}`;

    return this.http.put<any>(uploadUrl, data).pipe(
      catchError(this.handleError),
    );
  }

  /**
   * Returns material from backend by material ID.
   * @param {number} materialId
   * @returns {Observable<EducationalMaterial>} Educational Material
   */
  getMaterial(materialId: number): Observable<EducationalMaterial> {
    return this.http.get<any>(`${this.backendUrl}/material/${materialId}`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).pipe(
      map((res): EducationalMaterial => {
        const alignmentObjects: AlignmentObjectExtended[] = res.educationalAlignment
        // tslint:disable-next-line:max-line-length
          .map(({ objectkey, source, alignmenttype, educationalframework, targetname }) => ({ key: objectkey, source: source, alignmentType: alignmenttype, educationalFramework: educationalframework, targetName: targetname }));

        return {
          name: res.name,
          thumbnail: res.thumbnail
            ? res.thumbnail.filepath
            : `assets/img/thumbnails/${res.learningResourceTypes[0].learningresourcetypekey}.png`,
          learningResourceTypes: res.learningResourceTypes
            .map(({ learningresourcetypekey, value }) => ({ learningresourcetypekey, value })),
          authors: res.author
            .map(({ authorname, organization }) => ({ authorname, organization })),
          description: res.description,
          materials: res.materials.map(m => ({
            id: m.id,
            language: m.language,
            priority: m.priority,
            originalfilename: m.originalfilename,
            filekey: m.filekey,
            link: m.link,
            mimetype: m.mimetype,
            displayName: m.displayName
          })),
          createdAt: res.createdAt,
          publishedAt: res.publishedAt,
          updatedAt: res.updatedAt,
          timeRequired: res.timeRequired,
          license: res.license,
          keywords: res.keywords
            .map(({ keywordkey, value }) => ({ keywordkey, value })),
          educationalLevels: res.educationalLevels
            .map(({ educationallevelkey, value }) => ({ educationallevelkey, value })),
          educationalRoles: res.educationalRoles
            .map(({ educationalrolekey, educationalrole }) => ({ educationalrolekey, educationalrole })),
          educationalUses: res.educationalUses
            .map(({ educationalusekey, value }) => ({ educationalusekey, value })),
          accessibilityFeatures: res.accessibilityFeatures
            .map(({ accessibilityfeaturekey, value }) => ({ accessibilityfeaturekey, value })),
          accessibilityHazards: res.accessibilityHazards
            .map(({ accessibilityhazardkey, value }) => ({ accessibilityhazardkey, value })),
          earlyChildhoodEducationSubjects: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.earlyChildhoodSubjects),
          earlyChildhoodEducationObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.earlyChildhoodObjectives),
          prePrimaryEducationSubjects: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.prePrimarySubjects),
          prePrimaryEducationObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.prePrimaryObjectives),
          basicStudySubjects: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.basicStudySubjects),
          basicStudyObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.basicStudyObjectives),
          basicStudyContents: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.basicStudyContents),
          upperSecondarySchoolSubjects: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondarySubjects),
          upperSecondarySchoolObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryObjectives),
          upperSecondarySchoolSubjectsNew: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondarySubjectsNew),
          upperSecondarySchoolModulesNew: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryModulesNew),
          upperSecondarySchoolObjectivesNew: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryObjectivesNew),
          upperSecondarySchoolContentsNew: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryContentsNew),
          vocationalDegrees: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.vocationalDegrees),
          vocationalUnits: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.vocationalUnits),
          vocationalEducationObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.vocationalObjectives),
          selfMotivatedEducationSubjects: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.selfMotivatedSubjects),
          selfMotivatedEducationObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.selfMotivatedObjectives),
          branchesOfScience: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.scienceBranches),
          scienceBranchObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.scienceBranchObjectives),
          prerequisites: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.prerequisites),
          subtitles: res.attachments.map((a: Attachment) => ({
            filepath: a.filepath,
            default: a.defaultfile,
            kind: a.kind,
            label: a.label,
            srclang: a.srclang,
            materialId: a.materialid,
          })),
        };
      })
    );
  }

  /**
   * Returns list of educational materials by user.
   * @returns {Observable<EducationalMaterialList>} List of educational materials
   */
  getUserMaterialList(): Observable<EducationalMaterialList[]> {
    return this.http.get<any>(`${this.backendUrl}/usermaterial`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).pipe(
      map((res): EducationalMaterialList[] => {
        return res
          .filter(r => r.name.length > 0)
          .map(r => {
            return {
              id: r.id,
              name: r.name,
              thumbnail: r.thumbnail
                ? r.thumbnail.thumbnail
                : `assets/img/thumbnails/${r.learningResourceTypes[0].learningresourcetypekey}.png`,
              learningResourceTypes: r.learningResourceTypes
                .map(({ learningresourcetypekey, value }) => ({ learningresourcetypekey, value })),
              authors: r.authors
                .map(({ authorname, organization }) => ({ authorname, organization })),
              description: r.description,
              license: r.license,
              keywords: r.keywords
                .map(({ keywordkey, value }) => ({ keywordkey, value })),
              educationalLevels: r.educationalLevels
                .map(({ educationallevelkey, value }) => ({ educationallevelkey, value })),
            };
          });
      }),
      catchError(this.handleError),
    );
  }

  getRecentMaterialList(): Observable<EducationalMaterialList[]> {
    return this.http.get<any>(`${this.backendUrl}/recentmaterial`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).pipe(
      map((res): EducationalMaterialList[] => {
        return res
          .filter(r => r.name.length > 0)
          .map(r => {
            return {
              id: r.id,
              name: r.name,
              slug: r.name
                .find(n => n.language.toLowerCase() === this.lang).slug,
              thumbnail: r.thumbnail
                ? r.thumbnail.thumbnail
                : `assets/img/thumbnails/${r.learningResourceTypes[0].learningresourcetypekey}.png`,
              learningResourceTypes: r.learningResourceTypes
                .map(({ learningresourcetypekey, value }) => ({ learningresourcetypekey, value })),
              authors: r.authors
                .map(({ authorname, organization }) => ({ authorname, organization })),
              description: r.description,
              license: r.license,
              keywords: r.keywords
                .map(({ keywordkey, value }) => ({ keywordkey, value })),
              educationalLevels: r.educationalLevels
                .map(({ educationallevelkey, value }) => ({ educationallevelkey, value })),
            };
          });
      }),
      catchError(this.handleError),
    );
  }

  /**
   * Upload thumbnail image for educational material to backend.
   * @param {FormData} data
   * @returns {Observable<UploadMessage>} Upload message
   */
  uploadImage(data: { base64image: string }): Observable<UploadMessage> {
    if (sessionStorage.getItem(this.localStorageKey) !== null) {
      const fileUpload = JSON.parse(sessionStorage.getItem(this.localStorageKey));

      return this.http.post<{ base64image: string }>(`${this.backendUrl}/uploadBase64Image/${fileUpload.id}`, data, {
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }),
        reportProgress: true,
        observe: 'events',
      }).pipe(
        map((event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              const progress = Math.round(100 * event.loaded / event.total);
              return { status: 'progress', message: progress };

            case HttpEventType.Response:
              return { status: 'completed', message: event.body };

            default:
              return { status: 'error', message: `Unhandled event: ${event.type}` };
          }
        }),
        catchError(this.handleError),
      );
    }
  }

  /**
   * Updates uploaded files list.
   * @param {number} materialId
   */
  updateUploadedFiles(materialId: number): void {
    this.http.get<any>(`${this.backendUrl}/material/${materialId}`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      })
    }).subscribe((res) => {
      // tslint:disable-next-line:max-line-length
      this.uploadedFiles$.next(res.materials.map(({ id, originalfilename, language, link, displayName }) => ({ id, file: originalfilename, language, link, displayName })));
    });
  }

  /**
   * Deletes file from backend.
   * @param {number} fileId
   */
  deleteFile(fileId: number): Observable<any> {
    if (sessionStorage.getItem(this.localStorageKey) !== null) {
      const fileUpload = JSON.parse(sessionStorage.getItem(this.localStorageKey));

      return this.http.delete(`${this.backendUrl}/material/file/${fileUpload.id}/${fileId}`)
        .pipe(
          catchError(this.handleError),
        );
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      this.authSvc.removeUserdata();
    }

    return throwError('Something bad happened; please try again later.');
  }
}
