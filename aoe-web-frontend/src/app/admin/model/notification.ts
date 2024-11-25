import { SafeHtml } from '@angular/platform-browser';

export interface Notification {
  id?: string;
  text: string | SafeHtml;
  type: 'INFO' | 'ERROR';
  createdAt?: string;
  showSince?: string;
  showUntil?: string;
  disabled?: boolean;
}

export interface NotificationDisabled {
  id: string;
  affected?: number;
}
