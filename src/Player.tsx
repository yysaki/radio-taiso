import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { loadYouTubeApi } from './youtube.ts'
import type { YTPlayer } from './youtube.ts'

type PlayerProps = {
  videoId: string
  /** videoId が変わったときに自動再生するか (false なら頭出しのみ) */
  autoplay: boolean
  onEnded: () => void
}

export function Player({ videoId, autoplay, onEnded }: PlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const loadedIdRef = useRef(videoId)
  const [ready, setReady] = useState(false)
  const handleEnded = useEffectEvent(onEnded)

  useEffect(() => {
    const container = containerRef.current!
    // YT.Player は渡した要素を iframe に置き換えるので、React が管理しない子要素を渡す
    const target = document.createElement('div')
    container.append(target)
    let aborted = false
    let player: YTPlayer | undefined

    async function createPlayer() {
      const YT = await loadYouTubeApi()
      if (aborted) return
      player = new YT.Player(target, {
        host: 'https://www.youtube-nocookie.com',
        videoId: loadedIdRef.current,
        playerVars: { playsinline: 1, rel: 0 },
        events: {
          onReady: () => {
            playerRef.current = player!
            setReady(true)
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.ENDED) handleEnded()
          },
        },
      })
    }
    createPlayer().catch((error: unknown) => console.error(error))

    return () => {
      aborted = true
      playerRef.current = null
      setReady(false)
      player?.destroy()
      container.replaceChildren()
    }
  }, [])

  useEffect(() => {
    const player = playerRef.current
    if (!ready || !player || videoId === loadedIdRef.current) return
    loadedIdRef.current = videoId
    if (autoplay) {
      player.loadVideoById(videoId)
    } else {
      player.cueVideoById(videoId)
    }
  }, [ready, videoId, autoplay])

  return (
    <div className="player">
      <div className="player-frame" ref={containerRef} />
    </div>
  )
}
