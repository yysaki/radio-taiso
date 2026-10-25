import { ref } from 'remix/component'
import type { Handle } from 'remix/component'
import { loadYouTubeApi } from './youtube.ts'
import type { YTPlayer } from './youtube.ts'

type PlayerProps = {
  videoId: string
  /** videoId が変わったときに自動再生するか (false なら頭出しのみ) */
  autoplay: boolean
  onEnded: () => void
}

export function Player(handle: Handle<PlayerProps>) {
  let player: YTPlayer | undefined
  let ready = false
  let loadedId = handle.props.videoId

  function sync() {
    if (!player || !ready) return
    let { videoId, autoplay } = handle.props
    if (videoId === loadedId) return
    loadedId = videoId
    if (autoplay) {
      player.loadVideoById(videoId)
    } else {
      player.cueVideoById(videoId)
    }
  }

  async function createPlayer(target: HTMLElement, signal: AbortSignal) {
    let YT = await loadYouTubeApi()
    if (signal.aborted) return
    player = new YT.Player(target, {
      host: 'https://www.youtube-nocookie.com',
      videoId: loadedId,
      playerVars: { playsinline: 1, rel: 0 },
      events: {
        onReady: () => {
          ready = true
          sync()
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.ENDED) handle.props.onEnded()
        },
      },
    })
  }

  let mount = ref((node, signal) => {
    // YT.Player は渡した要素を iframe に置き換えるので、Remix が管理しない子要素を渡す
    let target = document.createElement('div')
    node.append(target)
    createPlayer(target, signal).catch((error: unknown) => console.error(error))
    signal.addEventListener('abort', () => player?.destroy())
  })

  return () => {
    handle.queueTask(sync)
    return (
      <div class="player">
        <div class="player-frame" mix={mount} />
      </div>
    )
  }
}
