export interface NotificationOption {
  key: number
  value: NotificationType
  description: string
}

export enum NotificationType {
  INFO = 0,
  ERROR = 1
}
