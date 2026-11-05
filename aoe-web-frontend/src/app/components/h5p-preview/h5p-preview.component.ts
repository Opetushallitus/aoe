import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core'
import { TranslatePipe } from '@ngx-translate/core'
import { H5P } from 'h5p-standalone'

import { Material } from '@models/material'
import { FocusRemoverDirective } from '../../directives/focus-remover.directive'

const PLAYER_PATH = '/assets/h5p-standalone'

// h5p-standalone keeps its settings in the global window.H5PIntegration, so players
// (e.g. several previews in a collection) are created one at a time.
let renderQueue: Promise<void> = Promise.resolve()

@Component({
  selector: 'app-h5p-preview',
  template: `
    <a [href]="'/h5p/play/' + material.filekey" target="_blank" rel="noopener nofollow" class="btn btn-outline-secondary mb-2">
      {{ "demo.educationalMaterial.preview.openInNewTab" | translate }}
    </a>
    <div #player></div>
  `,
  // The global :focus rule drops the border, which shifts the player on mouse press.
  styles: `
    .btn:focus {
      border: var(--bs-btn-border-width) solid var(--bs-btn-border-color);
    }
    .btn:focus:active {
      border-color: var(--bs-btn-active-border-color);
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FocusRemoverDirective, TranslatePipe]
})
export class H5pPreviewComponent implements OnChanges, OnDestroy {
  @Input() material: Material
  // Emits the filepath of a package that could not be played.
  @Output() loadFailed = new EventEmitter<string>()
  @ViewChild('player', { static: true }) player: ElementRef<HTMLElement>
  // Stops waiting for the current player, whose detached iframe would never finish loading
  // and so would block the queue for every other preview.
  private cancelRender = (): void => undefined

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
    this.player.nativeElement.replaceChildren(anchor)
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
