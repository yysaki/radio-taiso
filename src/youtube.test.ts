import { beforeEach, expect, test, vi } from 'vitest'
import type { YTNamespace } from './youtube.ts'

// loadYouTubeApi は読み込み結果をモジュール内にキャッシュするので、テストごとに読み込み直す
async function importFresh() {
  vi.resetModules()
  return import('./youtube.ts')
}

function apiScripts() {
  return document.head.querySelectorAll('script[src="https://www.youtube.com/iframe_api"]')
}

beforeEach(() => {
  document.head.innerHTML = ''
  delete window.YT
  delete window.onYouTubeIframeAPIReady
})

test('スクリプトを1回だけ挿入し、API の準備ができたら YT を返す', async () => {
  const { loadYouTubeApi } = await importFresh()
  const first = loadYouTubeApi()
  const second = loadYouTubeApi()
  expect(apiScripts()).toHaveLength(1)

  const fakeYT = { Player: vi.fn(), PlayerState: { ENDED: 0 } } as unknown as YTNamespace
  window.YT = fakeYT
  window.onYouTubeIframeAPIReady!()

  await expect(first).resolves.toBe(fakeYT)
  await expect(second).resolves.toBe(fakeYT)
})

test('すでに YT が読み込まれていればスクリプトを挿入しない', async () => {
  const fakeYT = { Player: vi.fn(), PlayerState: { ENDED: 0 } } as unknown as YTNamespace
  window.YT = fakeYT
  const { loadYouTubeApi } = await importFresh()

  await expect(loadYouTubeApi()).resolves.toBe(fakeYT)
  expect(apiScripts()).toHaveLength(0)
})

test('スクリプトの読み込みに失敗したら reject する', async () => {
  const { loadYouTubeApi } = await importFresh()
  const promise = loadYouTubeApi()
  apiScripts()[0]!.dispatchEvent(new Event('error'))

  await expect(promise).rejects.toThrow('YouTube IFrame API の読み込みに失敗しました')
})
