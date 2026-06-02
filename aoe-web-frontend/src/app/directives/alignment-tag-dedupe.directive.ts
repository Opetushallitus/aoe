import { DestroyRef, Directive, ElementRef, OnInit, Renderer2, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { NgControl } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'
import { AlignmentObjectExtended } from '@models/alignment-object-extended'
import { dedupeAlignmentObjectsWithDropped } from '@shared/shared.module'

/**
 * Apply to a free-text alignment `ng-select` bound to a reactive form control.
 *
 * On every value change it removes entries colliding on the DB key tuple
 * (alignmentType, key, source), keeping the first — dropping a just-added
 * near-duplicate. The drop is surfaced accessibly: a single visible
 * `role="status" aria-live="polite"` element (class `aoe-tag-dedupe-message`)
 * is injected after the host and announces the dropped value(s) to screen
 * readers while staying visible to sighted and cognitive-load users. The region
 * is created empty on init (so the first announcement is reliable) and cleared
 * on the next change, so it never lingers as stale text.
 *
 * No-op when the host has no control or the value is not an array.
 */
@Directive({
  selector: '[aoeAlignmentTagDedupe]'
})
export class AlignmentTagDedupeDirective implements OnInit {
  private readonly ngControl = inject(NgControl, { self: true, optional: true })
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef)
  private readonly renderer = inject(Renderer2)
  private readonly translate = inject(TranslateService)
  private readonly destroyRef = inject(DestroyRef)

  /** Display names of items dropped in the most recent change; empty = nothing to show. */
  private readonly droppedNames = signal<string[]>([])

  /** Visible live region, created empty on init so the first mutation is announced. */
  private liveRegion?: HTMLElement

  ngOnInit(): void {
    const control = this.ngControl?.control
    if (!control) {
      return
    }

    this.createLiveRegion()

    control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: unknown) => {
      // Clear at the top of every pass; re-set only if a drop happens this pass,
      // so the message clears on the user's next interaction with the field.
      this.droppedNames.set([])

      if (Array.isArray(value)) {
        const { deduped, dropped } = dedupeAlignmentObjectsWithDropped(
          value as AlignmentObjectExtended[]
        )
        if (dropped.length > 0) {
          this.droppedNames.set(
            dropped
              .map((item) => item.targetName)
              .filter((name): name is string => typeof name === 'string' && name.length > 0)
          )
          // emitEvent:false prevents re-triggering valueChanges (no feedback loop).
          control.setValue(deduped, { emitEvent: false })
        }
      }

      this.renderMessage()
    })

    // The message is persistent, so re-render it if the user switches language.
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.renderMessage())

    // The live region is parented imperatively, so remove it explicitly.
    this.destroyRef.onDestroy(() => this.removeLiveRegion())
  }

  private createLiveRegion(): void {
    const el = this.renderer.createElement('small') as HTMLElement
    this.renderer.setAttribute(el, 'role', 'status')
    this.renderer.setAttribute(el, 'aria-live', 'polite')
    this.renderer.setAttribute(el, 'aria-atomic', 'true')
    // form-text matches the existing inline hints; the dedicated class makes the
    // injected element greppable and styleable. Meaning is carried by text, not colour.
    this.renderer.addClass(el, 'form-text')
    this.renderer.addClass(el, 'aoe-tag-dedupe-message')

    const hostEl = this.host.nativeElement
    const parent = this.renderer.parentNode(hostEl)
    if (parent) {
      this.renderer.insertBefore(parent, el, this.renderer.nextSibling(hostEl))
    }
    this.liveRegion = el
  }

  private renderMessage(): void {
    if (!this.liveRegion) {
      return
    }
    const names = this.droppedNames()
    // Keep the (empty) region in the DOM rather than removing it, so future drops
    // are still announced reliably. Use textContent (never innerHTML) for user text.
    const message =
      names.length === 0
        ? ''
        : names.length === 1
          ? this.translate.instant('forms.alignmentTags.duplicateDropped', { value: names[0] })
          : this.translate.instant('forms.alignmentTags.duplicatesDropped', { count: names.length })
    this.renderer.setProperty(this.liveRegion, 'textContent', message)
  }

  private removeLiveRegion(): void {
    if (!this.liveRegion) {
      return
    }
    const parent = this.renderer.parentNode(this.liveRegion)
    if (parent) {
      this.renderer.removeChild(parent, this.liveRegion)
    }
    this.liveRegion = undefined
  }
}
