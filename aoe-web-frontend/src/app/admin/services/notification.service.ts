import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from '@environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Notification, NotificationDisabled } from '@admin/model';
import { catchError, finalize } from 'rxjs/operators';

@Injectable()
export class NotificationService {
  private notifications$$: BehaviorSubject<Notification[]> = new BehaviorSubject<Notification[]>([] as Notification[]);

  public notifications$: Observable<Notification[]> = this.notifications$$.asObservable();

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  /**
   * Get all active notifications and save to the state management.
   */
  getScheduledNotifications(showUpcoming?: boolean): void {
    const requestURL: string = `${environment.backendUrlV2}/process/notifications${showUpcoming ? '/all' : ''}`;
    this.http
      .get<Notification[]>(requestURL, {
        headers: new HttpHeaders({
          Accept: 'application/json',
        }),
      })
      .subscribe(
        (notifications: Notification[]): void => {
          notifications.forEach((notification: Notification): void => {
            notification.text = decodeURIComponent(notification.text as string);
            notification.text = this.sanitizer.bypassSecurityTrustHtml(notification.text as string);
          });
          this.notifications$$.next(notifications);
        },
        (err: HttpErrorResponse): void => console.error('Getting all active notifications failed:', err),
      );
  }

  /**
   * Set a scheduled notification.
   * @param {Notification} notification
   * @return {Observable<Notification>}
   */
  setScheduledNotification(notification: Notification, showUpcoming?: boolean): Observable<Notification> {
    return this.http
      .post<Notification>(`${environment.backendUrlV2}/process/notifications`, notification, {
        headers: new HttpHeaders({
          Accept: 'application/json',
        }),
      })
      .pipe(
        catchError((err) => of(err)),
        finalize((): void => {
          this.getScheduledNotifications(showUpcoming);
        }),
      );
  }

  /**
   * Set a scheduled notification disabled.
   * @param {string} notificationID
   * @return {Observable<NotificationDisabled>}
   */
  setScheduledNotificationDisabled(notificationID: string, showUpcoming?: boolean): Observable<NotificationDisabled> {
    return this.http
      .patch<NotificationDisabled>(
        `${environment.backendUrlV2}/process/notifications/${notificationID}`,
        { id: notificationID, disabled: true },
        {
          headers: new HttpHeaders({
            Accept: 'application/json',
          }),
        },
      )
      .pipe(
        catchError((err) => of(err)),
        finalize((): void => {
          this.getScheduledNotifications(showUpcoming);
        }),
      );
  }
}
