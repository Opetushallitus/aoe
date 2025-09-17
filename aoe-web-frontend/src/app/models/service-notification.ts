import { SafeHtml } from '@angular/platform-browser'

export interface ServiceNotification {
  id?: string
  text: string | SafeHtml
  type: 'INFO' | 'ERROR'
  createdAt?: string
  showSince?: string
  showUntil?: string
  disabled?: boolean
}
