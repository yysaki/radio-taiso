import { on } from 'remix/component'
import type { Handle } from 'remix/component'
import { Player } from './Player.tsx'
import { loadContinuous, saveContinuous } from './storage.ts'
import { indexFromHash, videos } from './videos.ts'

export function App(handle: Handle) {
  let current = indexFromHash(location.hash)
  let continuous = loadContinuous()
  // 連続再生で次のタブへ進んだときだけ自動再生する
  let autoplay = false
  let advancing = false

  window.addEventListener(
    'hashchange',
    () => {
      current = indexFromHash(location.hash)
      autoplay = advancing
      advancing = false
      void handle.update()
    },
    { signal: handle.signal },
  )

  function handleEnded() {
    if (!continuous) return
    let next = videos[current + 1]
    if (!next) return
    advancing = true
    location.hash = next.slug
  }

  return () => {
    let video = videos[current]!

    return (
      <main class="page">
        <header class="page-header">
          <h1 class="page-title">ラジオ体操</h1>
        </header>

        <div class="tabs" role="tablist" aria-label="体操の種類">
          {videos.map((v, index) => (
            <button
              type="button"
              role="tab"
              id={`tab-${v.slug}`}
              class="tab"
              aria-label={v.title}
              aria-selected={index === current ? 'true' : 'false'}
              aria-controls="player-panel"
              mix={on('click', () => {
                location.hash = v.slug
              })}
            >
              {v.tabLabel.map((segment) => (
                <span class="tab-segment">{segment}</span>
              ))}
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
          <Player videoId={video.youtubeId} autoplay={autoplay} onEnded={handleEnded} />
          <label class="toggle">
            <input
              type="checkbox"
              checked={continuous}
              mix={on('change', (event) => {
                continuous = event.currentTarget.checked
                saveContinuous(continuous)
                void handle.update()
              })}
            />
            <span>連続再生（終わったら次の体操へ）</span>
          </label>
        </section>
      </main>
    )
  }
}
