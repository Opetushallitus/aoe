import { Component, inject } from '@angular/core'
import { TranslatePipe } from '@ngx-translate/core'

import { ToastService } from '@services/toast.service'

@Component({
  selector: 'app-toast-container',
  imports: [TranslatePipe],
  template: `
    <div class="toast-stack" aria-live="polite" aria-atomic="false">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="alert alert-dismissible toast-item"
          [class.alert-success]="toast.type === 'success'"
          [class.alert-danger]="toast.type === 'error'"
          [class.alert-warning]="toast.type === 'warning'"
          [class.alert-info]="toast.type === 'info'"
          [attr.role]="toast.type === 'error' ? 'alert' : 'status'"
        >
          @if (toast.title) {
            <strong class="d-block">{{ toast.title }}</strong>
          }
          @if (toast.message) {
            <span>{{ toast.message }}</span>
          }
          <button
            type="button"
            class="btn-close"
            [attr.aria-label]="'forms.common.close' | translate"
            (click)="toastService.remove(toast.id)"
          ></button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-stack {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1090;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: min(90vw, 24rem);
        pointer-events: none;
      }

      .toast-item {
        pointer-events: auto;
        margin: 0;
        box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.15);
      }
    `
  ]
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService)
}
