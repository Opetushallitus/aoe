import { Directive, ElementRef, HostListener } from '@angular/core'

@Directive({
    // eslint-disable-next-line
    selector: 'button, a, [role=button]',
    standalone: false
})
export class FocusRemoverDirective {
  constructor(private elRef: ElementRef) {}

  @HostListener('click') onClick(): void {
    this.elRef.nativeElement.blur()
  }
}
