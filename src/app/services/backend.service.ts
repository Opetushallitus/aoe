import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { environment } from '../../environments/environment';
import { getLocalStorageData } from '../shared/shared.module';
import { EducationalMaterial } from '../models/educational-material';
import { UploadMessage } from '../models/upload-message';
import { AuthService } from './auth.service';
import { User } from '../models/user';
import { EducationalMaterialList } from '../models/educational-material-list';
import { AlignmentObjectExtended } from '../models/alignment-object-extended';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private backendUrl = environment.backendUrl;
  private localStorageKey = environment.fileUploadLSKey;
  private lang: string = this.translate.currentLang;

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
  public uploadFiles(data: FormData): Observable<UploadMessage> {
    let uploadUrl: string;

    if (localStorage.getItem(this.localStorageKey) !== null) {
      const fileUpload = getLocalStorageData(this.localStorageKey);

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
            const fileUpload = getLocalStorageData(this.localStorageKey);

            if (fileUpload !== null) {
              const materials = fileUpload['material'].concat(event.body['material']);
              const response = {
                id: fileUpload.id,
                material: materials,
              };

              localStorage.setItem(this.localStorageKey, JSON.stringify(response));
            } else {
              localStorage.setItem(this.localStorageKey, JSON.stringify(event.body));
            }

            return { status: 'completed', message: event.body };

          default:
            return { status: 'error', message: `Unhandled event: ${event.type}` };
        }
      })
    );
  }

  /**
   * Posts meta data to backend by material ID.
   * @param {number} materialId
   * @param {any} data
   */
  public postMeta(materialId: number, data: any) {
    const uploadUrl = `${this.backendUrl}/material/${materialId}`;

    return this.http.put<any>(uploadUrl, data);
  }

  /**
   * Returns material from backend by material ID.
   * @param {number} materialId
   * @returns {Observable<EducationalMaterial>} Educational Material
   */
  public getMaterial(materialId: number): Observable<EducationalMaterial> {
    return this.http.get<any>(`${this.backendUrl}/material/${materialId}`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).pipe(
      map((res): EducationalMaterial => {
        const alignmentObjects: AlignmentObjectExtended[] = res.educationalAlignment
          .map(({ objectkey, source, alignmenttype, educationalframework, targetname }) => ({ key: objectkey, source: source, alignmentType: alignmenttype, educationalFramework: educationalframework, targetName: targetname }));

        return {
          name: res.name
            .find(n => n.language.toLowerCase() === this.lang).materialname,
          thumbnail: res.thumbnail ? res.thumbnail.filepath : null,
          learningResourceTypes: res.learningResourceTypes
            .map(({ learningresourcetypekey, value }) => ({ learningresourcetypekey, value })),
          authors: res.author
            .map(({ authorname, organization }) => ({ authorname, organization })),
          description: res.description
            .find(d => d.language.toLowerCase() === this.lang).description,
          materials: res.materials
            .filter(m => m.key.toLowerCase() === this.lang)
            .map(({ id, originalfilename, filekey, link, mimetype }) => ({ id, originalfilename, filekey, link, mimetype })),
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
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'earlyChildhoodEducationSubjects'),
          earlyChildhoodEducationObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'earlyChildhoodEducationObjectives'),
          prePrimaryEducationSubjects: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'prePrimaryEducationSubjects'),
          prePrimaryEducationObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'prePrimaryEducationObjectives'),
          basicStudySubjects: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'basicStudySubjects'),
          basicStudyObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'basicStudyObjectives'),
          basicStudyContents: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'basicStudyContents'),
          upperSecondarySchoolSubjects: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'upperSecondarySchoolSubjects'),
          upperSecondarySchoolObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'upperSecondarySchoolObjectives'),
          vocationalDegrees: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'vocationalDegrees'),
          vocationalEducationObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'vocationalEducationObjectives'),
          selfMotivatedEducationSubjects: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'selfMotivatedEducationSubjects'),
          selfMotivatedEducationObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'selfMotivatedEducationObjectives'),
          branchesOfScience: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'branchesOfScience'),
          scienceBranchObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'scienceBranchObjectives'),
          prerequisites: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'prerequisites'),
        };
      })
    );
  }

  /**
   * Returns list of educational materials by user.
   * @param {User} user
   * @returns {Observable<EducationalMaterialList>} List of educational materials
   */
  public getUserMaterialList(): Observable<EducationalMaterialList[]> {
    const user = this.authSvc.getUser();

    return this.http.get<any>(`${this.backendUrl}/material/user/${user.username}`, {
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
              name: r.name
                .find(n => n.language.toLowerCase() === this.lang).materialname,
              thumbnail: r.thumbnail ? r.thumbnail.thumbnail : null,
              learningResourceTypes: r.learningResourceTypes
                .map(({ learningresourcetypekey, value }) => ({ learningresourcetypekey, value })),
              authors: r.authors
                .map(({ authorname, organization }) => ({ authorname, organization })),
              description: r.description
                .find(d => d.language.toLowerCase() === this.lang).description,
              license: r.license,
              keywords: r.keywords
                .map(({ keywordkey, value }) => ({ keywordkey, value })),
              educationalLevels: r.educationalLevels
                .map(({ educationallevelkey, value }) => ({ educationallevelkey, value })),
            };
          });
      })
    );
  }

  /**
   * Upload thumbnail image for educational material to backend.
   * @param {FormData} data
   * @returns {Observable<UploadMessage>} Upload message
   */
  public uploadImage(data: { base64image: string }): Observable<UploadMessage> {
    if (localStorage.getItem(this.localStorageKey) !== null) {
      const fileUpload = getLocalStorageData(this.localStorageKey);

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
        })
      );
    }
  }
}
