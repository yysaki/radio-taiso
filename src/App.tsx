import { useEffect, useRef, useState } from 'react'
import { Player } from './Player.tsx'
import { loadContinuous, saveContinuous } from './storage.ts'
import { nextSlug, slugFromHash, slugs, videos } from './videos.ts'

export function App() {
  const [current, setCurrent] = useState(() => slugFromHash(location.hash))
  const [continuous, setContinuous] = useState(loadContinuous)
  // 連続再生で次のタブへ進んだときだけ自動再生する
  const [autoplay, setAutoplay] = useState(false)
  const advancing = useRef(false)

  useEffect(() => {
    function handleHashChange() {
      setCurrent(slugFromHash(location.hash))
      setAutoplay(advancing.current)
      advancing.current = false
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  function handleEnded() {
    if (!continuous) return
    const next = nextSlug(current)
    if (!next) return
    advancing.current = true
    location.hash = next
  }

  const video = videos[current]

  return (
    <main className="page">
      <header className="page-header">
        <h1 className="page-title">ラジオ体操</h1>
      </header>

      <div className="tabs" role="tablist" aria-label="体操の種類">
        {slugs.map((slug) => (
          <button
            key={slug}
            type="button"
            role="tab"
            id={`tab-${slug}`}
            className="tab"
            aria-label={videos[slug].title}
            aria-selected={slug === current}
            aria-controls="player-panel"
            onClick={() => {
              location.hash = slug
            }}
          >
            {videos[slug].tabLabel.map((segment) => (
              <span key={segment} className="tab-segment">
                {segment}
              </span>
            ))}
          </button>
        ))}
      </div>

      <section id="player-panel" className="panel" role="tabpanel" aria-labelledby={`tab-${current}`}>
        <h2 className="panel-title">{video.title}</h2>
        <Player videoId={video.youtubeId} autoplay={autoplay} onEnded={handleEnded} />
        <label className="toggle">
          <input
            type="checkbox"
            checked={continuous}
            onChange={(event) => {
              const value = event.currentTarget.checked
              setContinuous(value)
              saveContinuous(value)
            }}
          />
          <span>連続再生（終わったら次の体操へ）</span>
        </label>
      </section>
    </main>
  )
}
