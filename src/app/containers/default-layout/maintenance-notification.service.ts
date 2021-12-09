import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';

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
    return this.http.get<Message>('https://demo.aoe.fi/api/v2/process/notification')
  }
}
