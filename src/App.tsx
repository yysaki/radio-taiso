import { on } from 'remix/component'
import type { Handle } from 'remix/component'
import { indexFromHash, videos } from './videos.ts'

export function App(handle: Handle) {
  let current = indexFromHash(location.hash)

  window.addEventListener(
    'hashchange',
    () => {
      current = indexFromHash(location.hash)
      void handle.update()
    },
    { signal: handle.signal },
  )

  return () => {
    let video = videos[current]!

    return (
      <main class="page">
        <header class="page-header">
          <h1 class="page-title">ラジオ体操</h1>
          <p class="page-lead">今日も元気に体を動かしましょう</p>
        </header>

        <div class="tabs" role="tablist" aria-label="体操の種類">
          {videos.map((v, index) => (
            <button
              type="button"
              role="tab"
              id={`tab-${v.slug}`}
              class="tab"
              aria-selected={index === current ? 'true' : 'false'}
              aria-controls="player-panel"
              mix={on('click', () => {
                location.hash = v.slug
              })}
            >
              {v.title}
            </button>
          ))}
        </div>

        <section
          id="player-panel"
          class="panel"
          role="tabpanel"
          aria-labelledby={`tab-${video.slug}`}
        >
          <h2 class="panel-title">{video.title}</h2>
        </section>
      </main>
    )
  }
}
