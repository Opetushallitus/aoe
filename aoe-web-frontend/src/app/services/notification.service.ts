import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { ServiceNotification } from '@models/service-notification';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications$$: BehaviorSubject<ServiceNotification[]> = new BehaviorSubject<ServiceNotification[]>(
    [] as ServiceNotification[],
  );
  public notifications$: Observable<ServiceNotification[]> = this.notifications$$.asObservable();

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  /**
   * Get currently active scheduled notifications.
   */
  getActiveNotifications(): void {
    this.http
      .get<ServiceNotification[]>(`${environment.backendUrlV2}/process/notifications`, {
        headers: new HttpHeaders({
          Accept: 'application/json',
        }),
      })
      .subscribe(
        (notifications: ServiceNotification[]): void => {
          notifications.forEach((notification: ServiceNotification): void => {
            notification.text = decodeURIComponent(notification.text as string);
            notification.text = this.sanitizer.bypassSecurityTrustHtml(notification.text as string);
          });
          this.notifications$$.next(notifications);
        },
        (err: HttpErrorResponse) => console.error(err),
      );
  }
}
