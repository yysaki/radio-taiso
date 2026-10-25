import { render } from 'remix/component/test'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { Player } from './Player.tsx'
import type { YTNamespace } from './youtube.ts'

type FakePlayerOptions = ConstructorParameters<YTNamespace['Player']>[1]

class FakePlayer {
  static instances: FakePlayer[] = []
  cueVideoById = vi.fn()
  loadVideoById = vi.fn()
  destroy = vi.fn()

  constructor(
    public element: HTMLElement,
    public options: FakePlayerOptions,
  ) {
    FakePlayer.instances.push(this)
  }

  ready() {
    this.options.events?.onReady?.()
  }

  end() {
    this.options.events?.onStateChange?.({ data: 0 })
  }
}

vi.mock('./youtube.ts', () => ({
  loadYouTubeApi: () => Promise.resolve({ Player: FakePlayer, PlayerState: { ENDED: 0 } }),
}))

let cleanup: (() => void) | undefined

beforeEach(() => {
  FakePlayer.instances = []
})

afterEach(() => {
  cleanup?.()
  cleanup = undefined
})

async function renderPlayer(props: { videoId: string; autoplay: boolean; onEnded?: () => void }) {
  let onEnded = props.onEnded ?? vi.fn()
  let result = render(<Player videoId={props.videoId} autoplay={props.autoplay} onEnded={onEnded} />)
  cleanup = result.cleanup
  await vi.waitFor(() => expect(FakePlayer.instances).toHaveLength(1))
  let player = FakePlayer.instances[0]!
  await result.act(() => player.ready())

  let rerender = (next: { videoId: string; autoplay: boolean }) =>
    result.act(() => result.root.render(<Player videoId={next.videoId} autoplay={next.autoplay} onEnded={onEnded} />))

  return { ...result, player, onEnded, rerender }
}

test('youtube-nocookie.com で初期の動画を表示する', async () => {
  let { player, $ } = await renderPlayer({ videoId: 'first', autoplay: false })

  expect(player.options).toMatchObject({ host: 'https://www.youtube-nocookie.com', videoId: 'first' })
  expect($('.player-frame')!.contains(player.element)).toBe(true)
  expect(player.cueVideoById).not.toHaveBeenCalled()
  expect(player.loadVideoById).not.toHaveBeenCalled()
})

test('自動再生しないときは頭出しだけする', async () => {
  let { player, rerender } = await renderPlayer({ videoId: 'first', autoplay: false })

  await rerender({ videoId: 'second', autoplay: false })

  expect(player.cueVideoById).toHaveBeenCalledWith('second')
  expect(player.loadVideoById).not.toHaveBeenCalled()
})

test('自動再生するときは読み込んで再生する', async () => {
  let { player, rerender } = await renderPlayer({ videoId: 'first', autoplay: false })

  await rerender({ videoId: 'second', autoplay: true })

  expect(player.loadVideoById).toHaveBeenCalledWith('second')
  expect(player.cueVideoById).not.toHaveBeenCalled()
})

test('同じ動画のまま再描画しても読み込み直さない', async () => {
  let { player, rerender } = await renderPlayer({ videoId: 'first', autoplay: false })

  await rerender({ videoId: 'first', autoplay: true })

  expect(player.cueVideoById).not.toHaveBeenCalled()
  expect(player.loadVideoById).not.toHaveBeenCalled()
})

test('再生が終わったら onEnded を呼ぶ', async () => {
  let { player, onEnded } = await renderPlayer({ videoId: 'first', autoplay: false })

  player.end()

  expect(onEnded).toHaveBeenCalledOnce()
})

test('取り除かれたらプレイヤーを破棄する', async () => {
  let { player } = await renderPlayer({ videoId: 'first', autoplay: false })

  cleanup?.()
  cleanup = undefined

  expect(player.destroy).toHaveBeenCalledOnce()
})
