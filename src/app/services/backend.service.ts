import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { getLocalStorageData } from '../shared/shared.module';
import { EducationalMaterial } from '../models/educational-material';
import { TranslateService } from '@ngx-translate/core';
import { UploadMessage } from '../models/upload-message';
import { User } from '../models/user';
import { EducationalMaterialList } from '../models/educational-material-list';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private backendUrl = environment.backendUrl;
  private localStorageKey = environment.fileUploadLSKey;
  private lang: string = this.translate.currentLang;

  constructor(
    private http: HttpClient,
    private translate: TranslateService
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
        return {
          name: res.name
            .find(n => n.language.toLowerCase() === this.lang).materialname,
          thumbnail: res.thumbnail ? res.thumbnail.filepath : null,
          learningResourceTypes: res.learningResourceTypes
            .map(type => type.value),
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
        };
      })
    );
  }

  /**
   * Returns list of educational materials by user.
   * @param {User} user
   * @returns {Observable<EducationalMaterialList[]>} List of educational materials
   */
  public getUserMaterialList(user: User): Observable<EducationalMaterialList[]> {
    return this.http.get<EducationalMaterialList[]>(`${this.backendUrl}/material/user/${user.username}`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    });
  }

  /**
   * Upload thumbnail image for educational material to backend.
   * @param {FormData} data
   * @returns {Observable<UploadMessage>} Upload message
   */
  public uploadImage(data: FormData): Observable<UploadMessage> {
    if (localStorage.getItem(this.localStorageKey) !== null) {
      const fileUpload = getLocalStorageData(this.localStorageKey);

      return this.http.post<FormData>(`${this.backendUrl}/uploadImage/${fileUpload.id}`, data, {
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
              return { status: 'completed', message: event.body };

            default:
              return { status: 'error', message: `Unhandled event: ${event.type}` };
          }
        })
      );
    }
  }
}
