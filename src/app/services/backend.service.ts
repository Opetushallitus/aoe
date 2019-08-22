import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
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
