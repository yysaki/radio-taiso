import { describe, expect, test } from 'vitest'
import { indexFromHash, nextVideo, videos } from './videos.ts'

describe('indexFromHash', () => {
  test.each([
    ['#daiichi', 0],
    ['#daini', 1],
    ['#minna', 2],
    ['daini', 1],
  ])('%s は %i 番目', (hash, expected) => {
    expect(indexFromHash(hash)).toBe(expected)
  })

  test.each(['', '#', '#unknown', '#DAINI'])('不正なハッシュ %j は第一', (hash) => {
    expect(indexFromHash(hash)).toBe(0)
  })
})

describe('nextVideo', () => {
  test('右隣の動画を返す', () => {
    expect(nextVideo(0)).toBe(videos[1])
    expect(nextVideo(1)).toBe(videos[2])
  })

  test('最後の動画の次はない', () => {
    expect(nextVideo(videos.length - 1)).toBeUndefined()
  })
})

test('slug は重複しない', () => {
  let slugs = videos.map((video) => video.slug)
  expect(new Set(slugs).size).toBe(slugs.length)
})
