export type Video = {
  /** URL ハッシュに使う識別子 */
  slug: string
  title: string
  /** タブの表示。狭い画面では区切りの位置でのみ折り返す */
  tabLabel: readonly string[]
  youtubeId: string
}

export const videos: readonly Video[] = [
  {
    slug: 'daiichi',
    title: 'ラジオ体操第一',
    tabLabel: ['ラジオ体操', '第一'],
    youtubeId: 'SGPBSqxKGAc',
  },
  {
    slug: 'daini',
    title: 'ラジオ体操第二',
    tabLabel: ['ラジオ体操', '第二'],
    youtubeId: 'aHlNoTpXf_8',
  },
  {
    slug: 'minna',
    title: 'みんなの体操',
    tabLabel: ['みんなの', '体操'],
    youtubeId: 'AlNMP0T0B3o',
  },
]

/** ハッシュに対応する動画の index を返す。該当しなければ先頭 (第一) */
export function indexFromHash(hash: string): number {
  const slug = hash.replace(/^#/, '')
  const index = videos.findIndex((video) => video.slug === slug)
  return index === -1 ? 0 : index
}

/** 連続再生で次に進む動画。最後の動画なら undefined */
export function nextVideo(index: number): Video | undefined {
  return videos[index + 1]
}
