import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { getLocalStorageData } from '../shared/shared.module';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private backendUrl = 'https://demo.aoe.fi/api';
  private localStorageKey = 'aoe.fileUpload';

  constructor(private http: HttpClient) { }

  public uploadFiles(data) {
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

  public postMeta(id, data) {
    const uploadUrl = `${this.backendUrl}/material/${id}`;

    return this.http.put<any>(uploadUrl, data);
  }

  public getMaterial(id): Observable<HttpResponse<any>> {
    return this.http.get(`${this.backendUrl}/material/${id}`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
      observe: 'response'
    });
  }
}
