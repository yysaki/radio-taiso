// YouTube IFrame Player API のうち、このアプリで使う部分だけの型定義
export type YTPlayer = {
  cueVideoById(videoId: string): void
  loadVideoById(videoId: string): void
  destroy(): void
}

export type YTNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      host?: string
      videoId?: string
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: () => void
        onStateChange?: (event: { data: number }) => void
      }
    },
  ) => YTPlayer
  PlayerState: { ENDED: number }
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

const API_URL = 'https://www.youtube.com/iframe_api'

let apiPromise: Promise<YTNamespace> | undefined

/** IFrame Player API を一度だけ読み込む */
export function loadYouTubeApi(): Promise<YTNamespace> {
  apiPromise ??= new Promise((resolve, reject) => {
    if (window.YT?.Player) {
      resolve(window.YT)
      return
    }
    window.onYouTubeIframeAPIReady = () => resolve(window.YT!)
    let script = document.createElement('script')
    script.src = API_URL
    script.async = true
    script.addEventListener('error', () =>
      reject(new Error('YouTube IFrame API の読み込みに失敗しました')),
    )
    document.head.append(script)
  })
  return apiPromise
}
