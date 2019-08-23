import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private backendUrl = 'http://aoe.fi:3001';

  constructor(private http: HttpClient) { }

  public uploadFiles(data) {
    const uploadUrl = `${this.backendUrl}/material/file`;

    return this.http.post<any>(uploadUrl, data, {
      reportProgress: true,
      observe: 'events',
      headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data'
      }),
    }).pipe(map((event) => {
      switch (event.type) {
        case HttpEventType.UploadProgress:
          const progress = Math.round(100 * event.loaded / event.total);
          return { status: 'progress', message: progress };
        case HttpEventType.Response:
          return event.body;
        default:
          return `Unhandled event: ${event.type}`;
      }
    }));
  }
}
