import { beforeEach, describe, expect, test, vi } from 'vitest'
import { loadContinuous, saveContinuous } from '../src/storage.ts'

beforeEach(() => {
  localStorage.clear()
})

describe('連続再生の設定', () => {
  test('未保存ならオン', () => {
    expect(loadContinuous()).toBe(true)
  })

  test('保存した値を読み戻せる', () => {
    saveContinuous(false)
    expect(loadContinuous()).toBe(false)
    saveContinuous(true)
    expect(loadContinuous()).toBe(true)
  })

  test('ストレージが使えなくても例外を出さず、オンとして扱う', () => {
    vi.stubGlobal('localStorage', {
      getItem() {
        throw new Error('SecurityError')
      },
      setItem() {
        throw new Error('QuotaExceededError')
      },
    })
    expect(() => saveContinuous(false)).not.toThrow()
    expect(loadContinuous()).toBe(true)
  })
})
