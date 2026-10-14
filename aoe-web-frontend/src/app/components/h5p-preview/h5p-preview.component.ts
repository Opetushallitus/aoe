import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ChangeDetectionStrategy
} from '@angular/core'
import { H5P } from 'h5p-standalone'

import { Material } from '@models/material'

const PLAYER_PATH = '/assets/h5p-standalone'

// h5p-standalone keeps its settings in the global window.H5PIntegration, so players
// (e.g. several previews in a collection) are created one at a time.
let renderQueue: Promise<void> = Promise.resolve()

@Component({
  selector: 'app-h5p-preview',
  template: '',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class H5pPreviewComponent implements OnChanges, OnDestroy {
  @Input() material: Material
  // Emits the filepath of a package that could not be played.
  @Output() loadFailed = new EventEmitter<string>()
  // Stops waiting for the current player, whose detached iframe would never finish loading
  // and so would block the queue for every other preview.
  private cancelRender = (): void => undefined

  constructor(private host: ElementRef<HTMLElement>) {}

  ngOnChanges(): void {
    const h5pJsonPath = this.material.filepath
    this.renderPlayer(h5pJsonPath).catch((error) => {
      console.error(error)
      this.loadFailed.emit(h5pJsonPath)
    })
  }

  ngOnDestroy(): void {
    this.cancelRender()
  }

  private renderPlayer(h5pJsonPath: string): Promise<void> {
    this.cancelRender()
    const cancelled = new Promise<void>((resolve) => {
      this.cancelRender = resolve
    })
    const anchor = document.createElement('div')
    this.host.nativeElement.replaceChildren(anchor)
    const render = renderQueue.then(async () => {
      if (!anchor.isConnected) {
        return // the material changed or the preview was closed while waiting
      }
      // h5p-standalone writes window.H5PIntegration before it appends the iframe, so a cancelled
      // render may only release the queue once its settings can no longer overwrite the next one's.
      const framed = new Promise<void>((resolve) =>
        new MutationObserver((_, observer) => {
          observer.disconnect()
          resolve()
        }).observe(anchor, { childList: true })
      )
      await Promise.race([
        new H5P(anchor, {
          id: this.material.id,
          h5pJsonPath,
          frameJs: `${PLAYER_PATH}/frame.bundle.js`,
          frameCss: `${PLAYER_PATH}/styles/h5p.css`
        }),
        Promise.all([cancelled, framed])
      ])
    })
    renderQueue = render.catch(() => undefined)
    return render
  }
}
