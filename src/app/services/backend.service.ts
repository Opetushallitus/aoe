import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private backendUrl = 'https://demo.aoe.fi/api';

  constructor(private http: HttpClient) { }

  public uploadFiles(data) {
    const uploadUrl = `${this.backendUrl}/material/file`;

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
          localStorage.setItem('aoe.fileUpload', JSON.stringify(event.body));
          return event.body;

        default:
          return `Unhandled event: ${event.type}`;
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
