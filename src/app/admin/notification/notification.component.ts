import { Component, ViewChild } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpHeaders } from '@angular/common/http';
import { NotificationMessage } from '../model';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent {
  @ViewChild('input') inputField;

  currentNotification: string;
  notificationUpdatedTime: string = '';
  newNotification: string = '';
  wrongFormat: string;

  ngOnInit(): void {
    this.getNotification();
  }

  constructor(private http: HttpClient) {
    //
  }

  getNotification(): void {
    this.http
      .get<NotificationMessage>(`${environment.backendUrl}/v2/process/notification`)
      .subscribe((message: NotificationMessage) => {
        if (message.notification != 'null') {
          this.currentNotification = message.notification;
          this.notificationUpdatedTime = message.updated;
        }
      });
  }

  private handleError(_error: HttpErrorResponse): Observable<never> {
    return throwError('Something bad happened; please try again later.');
  }

  postNotification(payload: NotificationMessage): Observable<NotificationMessage> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http
      .post<NotificationMessage>(`${environment.backendUrl}/v2/process/notification`, payload, { headers: headers })
      .pipe(catchError(this.handleError));
  }

  saveMessage(): void {
    this.wrongFormat = '';
    this.newNotification = this.inputField.nativeElement.value.trim();
    if (
      this.newNotification !== this.currentNotification &&
      this.newNotification.match('^[A-Öa-ö0-9.-\\s!?/:()]+$') &&
      this.newNotification.length < 250
    ) {
      this.inputField.nativeElement.value = '';

      const payload: NotificationMessage = {
        notification: this.newNotification,
        updated: null,
      };

      this.postNotification(payload).subscribe((response) => {
        if (response) {
          this.getNotification();
        } else {
          console.log('Ilmoitusta ei vaihdettu');
        }
      });
    } else {
      this.wrongFormat = 'Only letters and numbers allowed.';
    }
  }

  deleteNotification(): void {
    this.currentNotification = null;
    const payload: NotificationMessage = {
      notification: 'null',
      updated: null,
    };
    this.postNotification(payload).subscribe();
  }
}
