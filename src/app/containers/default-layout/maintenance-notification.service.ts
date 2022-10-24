import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Message {
  notification: string;
  updated: string;
}
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private http: HttpClient) {}

  getNotification(): Observable<Message> {
    return this.http.get<Message>(`${environment.backendUrlV2}/process/notification`);
  }
}
