import { describe, expect, test } from 'vitest'
import { nextSlug, slugFromHash } from '../src/videos.ts'

describe('slugFromHash', () => {
  test.each([
    ['#daiichi', 'daiichi'],
    ['#daini', 'daini'],
    ['#minna', 'minna'],
    ['daini', 'daini'],
  ])('%s は %s', (hash, expected) => {
    expect(slugFromHash(hash)).toBe(expected)
  })

  test.each(['', '#', '#unknown', '#DAINI', '#toString'])('不正なハッシュ %j は第一', (hash) => {
    expect(slugFromHash(hash)).toBe('daiichi')
  })
})

describe('nextSlug', () => {
  test('右隣の動画を返す', () => {
    expect(nextSlug('daiichi')).toBe('daini')
    expect(nextSlug('daini')).toBe('minna')
  })

  test('最後の動画の次はない', () => {
    expect(nextSlug('minna')).toBeUndefined()
  })
})
