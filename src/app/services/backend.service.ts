import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { getLocalStorageData } from '../shared/shared.module';
import { EducationalMaterial } from '../models/educational-material';
import { TranslateService } from '@ngx-translate/core';
import { UploadMessage } from '../models/upload-message';

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
   * @param {any} data
   * @returns {Observable<UploadMessage>} Upload progress
   */
  public uploadFiles(data: any): Observable<UploadMessage> {
    let uploadUrl: string;

    if (localStorage.getItem(this.localStorageKey) !== null) {
      const fileUpload = getLocalStorageData(this.localStorageKey);

      uploadUrl = `${this.backendUrl}/material/file/${fileUpload.id}`;
    } else {
      uploadUrl = `${this.backendUrl}/material/file`;
    }

    return this.http.post<any>(uploadUrl, data, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
      reportProgress: true,
      observe: 'events',
    }).pipe(map((event: HttpEvent<any>) => {
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
    }));
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
      observe: 'response'
    }).pipe(
      map(({ body }): EducationalMaterial => {
        return {
          name: body.name
            .find(n => n.language.toLowerCase() === this.lang).materialname,
          learningResourceTypes: body.learningResourceType
            .map(type => type.value),
          authors: body.author
            .map(({ authorname, organization }) => ({ authorname, organization })),
          description: body.description
            .find(d => d.language.toLowerCase() === this.lang).description,
          materials: body.materials
            .filter(m => m.key.toLowerCase() === this.lang)
            .map(({ id, originalfilename, filekey, link, mimetype }) => ({ id, originalfilename, filekey, link, mimetype })),
          createdAt: body.createdAt,
          publishedAt: body.publishedAt,
          updatedAt: body.updatedAt,
          timeRequired: body.timeRequired,
          license: body.license,
          keywords: body.keywords
            .map(({ keywordkey, value }) => ({ keywordkey, value })),
          educationalLevels: body.educationalLevel
            .map(({ educationallevelkey, value }) => ({ educationallevelkey, value })),
          educationalRoles: body.educationalRole
            .map(({ educationalrolekey, educationalrole }) => ({ educationalrolekey, educationalrole })),
          educationalUses: body.educationalUse
            .map(({ educationalusekey, value }) => ({ educationalusekey, value })),
          accessibilityFeatures: body.accessibilityFeatures
            .map(({ accessibilityfeaturekey, value }) => ({ accessibilityfeaturekey, value })),
          accessibilityHazards: body.accessibilityHazards
            .map(({ accessibilityhazardkey, value }) => ({ accessibilityhazardkey, value })),
        };
      })
    );
  }
}
