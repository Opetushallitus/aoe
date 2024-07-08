export interface NotificationOption {
  key: number;
  value: 'INFO' | 'ERROR';
  description: string;
}

export enum NotificationType {
  INFO,
  ERROR,
}
