import { act, cleanup, render } from '@testing-library/react'
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

beforeEach(() => {
  FakePlayer.instances = []
})

afterEach(() => {
  cleanup()
})

async function renderPlayer(props: { videoId: string; autoplay: boolean; onEnded?: () => void }) {
  let onEnded = props.onEnded ?? vi.fn()
  let result = render(<Player videoId={props.videoId} autoplay={props.autoplay} onEnded={onEnded} />)
  await vi.waitFor(() => expect(FakePlayer.instances).toHaveLength(1))
  let player = FakePlayer.instances[0]!
  act(() => player.ready())

  let rerender = (next: { videoId: string; autoplay: boolean; onEnded?: () => void }) =>
    result.rerender(<Player videoId={next.videoId} autoplay={next.autoplay} onEnded={next.onEnded ?? onEnded} />)

  return { ...result, player, onEnded, rerender }
}

test('youtube-nocookie.com で初期の動画を表示する', async () => {
  let { player, container } = await renderPlayer({ videoId: 'first', autoplay: false })

  expect(player.options).toMatchObject({ host: 'https://www.youtube-nocookie.com', videoId: 'first' })
  expect(container.querySelector('.player-frame')!.contains(player.element)).toBe(true)
  expect(player.cueVideoById).not.toHaveBeenCalled()
  expect(player.loadVideoById).not.toHaveBeenCalled()
})

test('自動再生しないときは頭出しだけする', async () => {
  let { player, rerender } = await renderPlayer({ videoId: 'first', autoplay: false })

  rerender({ videoId: 'second', autoplay: false })

  expect(player.cueVideoById).toHaveBeenCalledWith('second')
  expect(player.loadVideoById).not.toHaveBeenCalled()
})

test('自動再生するときは読み込んで再生する', async () => {
  let { player, rerender } = await renderPlayer({ videoId: 'first', autoplay: false })

  rerender({ videoId: 'second', autoplay: true })

  expect(player.loadVideoById).toHaveBeenCalledWith('second')
  expect(player.cueVideoById).not.toHaveBeenCalled()
})

test('同じ動画のまま再描画しても読み込み直さない', async () => {
  let { player, rerender } = await renderPlayer({ videoId: 'first', autoplay: false })

  rerender({ videoId: 'first', autoplay: true })

  expect(player.cueVideoById).not.toHaveBeenCalled()
  expect(player.loadVideoById).not.toHaveBeenCalled()
})

test('準備完了前に動画が変わったら、準備完了後に反映する', async () => {
  let onEnded = vi.fn()
  let { rerender } = render(<Player videoId="first" autoplay={false} onEnded={onEnded} />)
  await vi.waitFor(() => expect(FakePlayer.instances).toHaveLength(1))
  let player = FakePlayer.instances[0]!

  rerender(<Player videoId="second" autoplay={false} onEnded={onEnded} />)
  expect(player.cueVideoById).not.toHaveBeenCalled()

  act(() => player.ready())
  expect(player.cueVideoById).toHaveBeenCalledWith('second')
})

test('再生が終わったら onEnded を呼ぶ', async () => {
  let { player, onEnded } = await renderPlayer({ videoId: 'first', autoplay: false })

  player.end()

  expect(onEnded).toHaveBeenCalledOnce()
})

test('onEnded が差し替わってもプレイヤーを作り直さず、最新のものを呼ぶ', async () => {
  let { player, onEnded, rerender } = await renderPlayer({ videoId: 'first', autoplay: false })
  let latest = vi.fn()

  rerender({ videoId: 'first', autoplay: false, onEnded: latest })
  player.end()

  expect(FakePlayer.instances).toHaveLength(1)
  expect(onEnded).not.toHaveBeenCalled()
  expect(latest).toHaveBeenCalledOnce()
})

test('取り除かれたらプレイヤーを破棄する', async () => {
  let { player, unmount } = await renderPlayer({ videoId: 'first', autoplay: false })

  unmount()

  expect(player.destroy).toHaveBeenCalledOnce()
})
