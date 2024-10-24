import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Notification } from '@admin/model';
import { NotificationService } from '@admin/services/notification.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationOption, NotificationType } from '@admin/model/enumeration/NotificationType';
import { HttpErrorResponse } from '@angular/common/http';
import DOMPurify from 'isomorphic-dompurify';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  providers: [NotificationService],
})
export class NotificationComponent implements OnInit {
  form: FormGroup;
  isChecked: boolean = false;
  minDate: Date;
  tableColumnHeaders: string[] = ['ID', 'Tyyppi', 'Tiedote', 'Alkaa', 'Päättyy', 'Toiminnot'];
  selectOptionNotificationType: NotificationOption[] = [
    {
      key: 0,
      value: NotificationType.INFO,
      description: 'Yleinen tiedote tai ohjeistus palvelun käyttäjille',
    },
    {
      key: 1,
      value: NotificationType.ERROR,
      description: 'Tekninen häiriö tai käyttöä rajoittava tapahtuma',
    },
  ];

  notifications$: Observable<Notification[]> = this.notificationService.notifications$;

  constructor(private fb: FormBuilder, private notificationService: NotificationService, private toast: ToastrService) {
    this.minDate = new Date();
    this.form = this.fb.group({
      notification: ['', [Validators.required, Validators.maxLength(500)]],
      notificationType: ['', [Validators.required]],
      showSince: [''],
      showUntil: [''],
    });
    DOMPurify.addHook('afterSanitizeAttributes', (element: Element): void => {
      if (element.tagName === 'A' && !element.hasAttribute('target')) element.setAttribute('target', '_blank');
      if (element.tagName === 'A' && !element.hasAttribute('rel')) element.setAttribute('rel', 'noopener noreferrer');
    });
  }

  get notification(): FormControl {
    return this.form.get('notification') as FormControl;
  }

  get notificationType(): FormControl {
    return this.form.get('notificationType') as FormControl;
  }

  get showSince(): FormControl {
    return this.form.get('showSince') as FormControl;
  }

  get showUntil(): FormControl {
    return this.form.get('showUntil') as FormControl;
  }

  ngOnInit(): void {
    this.notificationService.getScheduledNotifications();
  }

  onCheckboxChange(): void {
    if (this.isChecked) {
      this.notificationService.getScheduledNotifications(true);
    } else {
      this.notificationService.getScheduledNotifications(false);
    }
  }

  onDelete(notificationID: string): void {
    this.notificationService.setScheduledNotificationDisabled(notificationID, this.isChecked).subscribe({
      error: (err): void => {
        this.toast.error('Tiedotteen poistossa tapahtui virhe');
        console.error(`Disabling a scheduled notification [#${notificationID}] failed:`, err);
      },
      complete: () => this.toast.success('Tiedotteen poisto onnistui'),
    });
  }

  onReset(event: Event): void {
    event.preventDefault();
    this.form.reset();
    (event.target as HTMLElement).blur();
  }

  onSubmit(): void {
    if (this.form.valid) {
      const sanitizedNotification: string = DOMPurify.sanitize(this.form.get('notification')?.value, {
        ALLOWED_ATTR: ['href', 'rel', 'target'],
        ALLOWED_TAGS: ['a', 'b', 'i'],
      });
      const encodedNotification: string = encodeURIComponent(sanitizedNotification);
      const selectedOrdinal: number = this.form.get('notificationType')?.value;
      const showSince: Date = this.showSince.value;
      const showUntil: Date = this.showUntil.value;
      let notification: Notification = {
        text: encodedNotification,
        type: NotificationType[selectedOrdinal] as 'INFO' | 'ERROR',
      };
      if (showSince) {
        showSince.setHours(0, 0, 0, 0);
        notification = {
          ...notification,
          showSince: showSince.toISOString(),
        };
      }
      if (showUntil) {
        showUntil.setHours(0, 0, 0, 0);
        showUntil.setDate(showUntil.getDate() + 1);
        notification = {
          ...notification,
          showUntil: showUntil.toISOString(),
        };
      }
      this.notificationService.setScheduledNotification(notification, this.isChecked).subscribe(
        () => this.form.reset(),
        (err: HttpErrorResponse): void => {
          this.toast.error('Tiedotteen tallennuksessa tapahtui virhe');
          console.error('Setting a scheduled notification failed:', err);
        },
        () => this.toast.success('Tiedotteen tallennus onnistui'),
      );
    }
  }
}
