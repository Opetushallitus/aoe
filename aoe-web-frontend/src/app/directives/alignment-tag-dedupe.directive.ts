import { Directive, OnDestroy, OnInit, Optional, Self } from '@angular/core'
import { NgControl } from '@angular/forms'
import { Subscription } from 'rxjs'
import { dedupeAlignmentObjects } from '@shared/shared.module'

/**
 * Apply to a free-text alignment `ng-select` bound to a reactive form control.
 * On every value change it removes entries colliding on the DB key tuple
 * (alignmentType, key, source), keeping the first — silently dropping a just-added
 * near-duplicate. No-op when the host has no control or the value is not an array.
 */
@Directive({
  selector: '[aoeAlignmentTagDedupe]'
})
export class AlignmentTagDedupeDirective implements OnInit, OnDestroy {
  private subscription?: Subscription

  constructor(@Self() @Optional() private ngControl: NgControl) {}

  ngOnInit(): void {
    const control = this.ngControl?.control
    if (!control) {
      return
    }
    this.subscription = control.valueChanges.subscribe((value: unknown) => {
      if (!Array.isArray(value)) {
        return
      }
      const deduped = dedupeAlignmentObjects(value)
      if (deduped.length !== value.length) {
        // emitEvent:false prevents re-triggering valueChanges (no feedback loop)
        control.setValue(deduped, { emitEvent: false })
      }
    })
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe()
  }
}
