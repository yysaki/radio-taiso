import type { Page } from '@playwright/test'

export type StubCall = [method: string, ...args: unknown[]]

declare global {
  interface Window {
    __ytPlayers: { calls: StubCall[]; end(): void }[]
  }
}

// 本物の IFrame API の代わりに、呼び出しを記録するだけの YT.Player を返す
const STUB_SCRIPT = `
window.__ytPlayers = [];
window.YT = {
  PlayerState: { ENDED: 0 },
  Player: class {
    constructor(element, options) {
      this.options = options;
      this.calls = [['init', options.videoId, options.host]];
      window.__ytPlayers.push(this);
      const iframe = document.createElement('iframe');
      element.replaceWith(iframe);
      setTimeout(() => options.events.onReady(), 0);
    }
    cueVideoById(id) { this.calls.push(['cue', id]); }
    loadVideoById(id) { this.calls.push(['load', id]); }
    destroy() { this.calls.push(['destroy']); }
    end() { this.options.events.onStateChange({ data: 0 }); }
  },
};
window.onYouTubeIframeAPIReady();
`

/** YouTube への通信を遮断し、IFrame API をスタブに差し替える */
export async function stubYouTube(page: Page) {
  await page.route(/youtube(-nocookie)?\.com|ytimg\.com/, (route) => {
    if (route.request().url() === 'https://www.youtube.com/iframe_api') {
      return route.fulfill({ contentType: 'text/javascript', body: STUB_SCRIPT })
    }
    return route.abort()
  })
}

export async function playerCalls(page: Page): Promise<StubCall[]> {
  await page.waitForFunction(() => window.__ytPlayers?.length === 1)
  return page.evaluate(() => window.__ytPlayers[0]!.calls)
}

export async function endVideo(page: Page) {
  await page.waitForFunction(() => window.__ytPlayers?.length === 1)
  await page.evaluate(() => window.__ytPlayers[0]!.end())
}
