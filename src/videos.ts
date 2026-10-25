export type Video = {
  /** URL ハッシュに使う識別子 */
  slug: string
  title: string
  youtubeId: string
}

export const videos: readonly Video[] = [
  { slug: 'daiichi', title: 'ラジオ体操第一', youtubeId: 'SGPBSqxKGAc' },
  { slug: 'daini', title: 'ラジオ体操第二', youtubeId: 'aHlNoTpXf_8' },
  { slug: 'minna', title: 'みんなの体操', youtubeId: 'AlNMP0T0B3o' },
]

/** ハッシュに対応する動画の index を返す。該当しなければ先頭 (第一) */
export function indexFromHash(hash: string): number {
  let slug = hash.replace(/^#/, '')
  let index = videos.findIndex((video) => video.slug === slug)
  return index === -1 ? 0 : index
}
