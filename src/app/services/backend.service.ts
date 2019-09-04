import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
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
    }).pipe(map((event: HttpEvent<any>) => {
      switch (event.type) {
        case HttpEventType.UploadProgress:
          const progress = Math.round(100 * event.loaded / event.total);
          return { status: 'progress', message: progress };

        case HttpEventType.Response:
          console.log(event.body);
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
}
