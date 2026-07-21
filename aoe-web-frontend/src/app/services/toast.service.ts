import { Injectable, signal } from '@angular/core'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: number
  type: ToastType
  message?: string
  title?: string
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([])

  private nextId = 0
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>()
  private readonly timeoutMs = 5000

  success(message?: string, title?: string): void {
    this.show('success', message, title)
  }

  error(message?: string, title?: string): void {
    this.show('error', message, title)
  }

  warning(message?: string, title?: string): void {
    this.show('warning', message, title)
  }

  info(message?: string, title?: string): void {
    this.show('info', message, title)
  }

  remove(id: number): void {
    const timer = this.timers.get(id)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(id)
    }
    this.toasts.update((list) => list.filter((toast) => toast.id !== id))
  }

  private show(type: ToastType, message?: string, title?: string): void {
    const id = this.nextId++
    this.toasts.update((list) => [...list, { id, type, message, title }])
    this.timers.set(
      id,
      setTimeout(() => this.remove(id), this.timeoutMs)
    )
  }
}
