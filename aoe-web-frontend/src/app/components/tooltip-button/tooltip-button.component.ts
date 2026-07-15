import { Component, Input } from '@angular/core'
import { TranslatePipe } from '@ngx-translate/core'
import { TooltipDirective } from 'ngx-bootstrap/tooltip'

type TooltipVariant = 'help'

@Component({
  selector: 'app-tooltip-button',
  template: `
    <button
      #tooltip="bs-tooltip"
      type="button"
      class="btn btn-link btn-tooltip"
      [tooltip]="key | translate"
      (keydown.escape)="tooltip.hide()"
      [attr.aria-label]="key | translate"
    >
      <img [src]="icons[variant]" alt="" />
    </button>
  `,
  imports: [TooltipDirective, TranslatePipe]
})
export class TooltipButtonComponent {
  @Input({ required: true }) key!: string
  @Input({ required: true }) variant!: TooltipVariant
  readonly icons: Record<TooltipVariant, string> = {
    help: 'assets/img/icons/ic_help.svg'
  }
}
