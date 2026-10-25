import { expect, test } from '@playwright/test'
import { endVideo, playerCalls, stubYouTube } from './youtube-stub.ts'

test.beforeEach(async ({ page }) => {
  await stubYouTube(page)
})

test('ハッシュなしでは第一を表示する', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('tab', { selected: true })).toHaveText('ラジオ体操第一')
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('ラジオ体操第一')
})

test('ハッシュでタブを直接開ける', async ({ page }) => {
  await page.goto('./#daini')
  await expect(page.getByRole('tab', { selected: true })).toHaveText('ラジオ体操第二')
  await expect.poll(() => playerCalls(page)).toContainEqual(['init', 'aHlNoTpXf_8', 'https://www.youtube-nocookie.com'])
})

test('不正なハッシュでは第一を表示する', async ({ page }) => {
  await page.goto('./#unknown')
  await expect(page.getByRole('tab', { selected: true })).toHaveText('ラジオ体操第一')
})

test('タブを押すと切り替わり、頭出しだけする', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('tab', { name: 'みんなの体操' }).click()
  await expect(page).toHaveURL(/#minna$/)
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('みんなの体操')
  await expect.poll(() => playerCalls(page)).toContainEqual(['cue', 'AlNMP0T0B3o'])
})

test('連続再生: 終わったら右隣へ進んで自動再生し、最後で止まる', async ({ page }) => {
  await page.goto('./#daini')
  await expect(page.getByRole('checkbox', { name: /連続再生/ })).toBeChecked()

  await endVideo(page)
  await expect(page).toHaveURL(/#minna$/)
  await expect.poll(() => playerCalls(page)).toContainEqual(['load', 'AlNMP0T0B3o'])

  await endVideo(page)
  await expect(page).toHaveURL(/#minna$/)
  expect((await playerCalls(page)).filter(([method]) => method === 'load')).toHaveLength(1)
})

test('連続再生をオフにすると進まず、設定は再読み込み後も残る', async ({ page }) => {
  await page.goto('./')
  const toggle = page.getByRole('checkbox', { name: /連続再生/ })
  await toggle.uncheck()

  await endVideo(page)
  await expect(page.getByRole('tab', { selected: true })).toHaveText('ラジオ体操第一')
  await expect(page).not.toHaveURL(/#daini$/)

  await page.reload()
  await expect(page.getByRole('checkbox', { name: /連続再生/ })).not.toBeChecked()
})

test('横スクロールが発生しない', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('tablist')).toBeVisible()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBe(0)
})
