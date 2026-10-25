import { useEffect, useRef, useState } from 'react'
import { Player } from './Player.tsx'
import { loadContinuous, saveContinuous } from './storage.ts'
import { indexFromHash, nextVideo, videos } from './videos.ts'

export function App() {
  const [current, setCurrent] = useState(() => indexFromHash(location.hash))
  const [continuous, setContinuous] = useState(loadContinuous)
  // 連続再生で次のタブへ進んだときだけ自動再生する
  const [autoplay, setAutoplay] = useState(false)
  const advancing = useRef(false)

  useEffect(() => {
    function handleHashChange() {
      setCurrent(indexFromHash(location.hash))
      setAutoplay(advancing.current)
      advancing.current = false
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  function handleEnded() {
    if (!continuous) return
    const next = nextVideo(current)
    if (!next) return
    advancing.current = true
    location.hash = next.slug
  }

  const video = videos[current]!

  return (
    <main className="page">
      <header className="page-header">
        <h1 className="page-title">ラジオ体操</h1>
      </header>

      <div className="tabs" role="tablist" aria-label="体操の種類">
        {videos.map((v, index) => (
          <button
            key={v.slug}
            type="button"
            role="tab"
            id={`tab-${v.slug}`}
            className="tab"
            aria-label={v.title}
            aria-selected={index === current}
            aria-controls="player-panel"
            onClick={() => {
              location.hash = v.slug
            }}
          >
            {v.tabLabel.map((segment) => (
              <span key={segment} className="tab-segment">
                {segment}
              </span>
            ))}
          </button>
        ))}
      </div>

      <section id="player-panel" className="panel" role="tabpanel" aria-labelledby={`tab-${video.slug}`}>
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
