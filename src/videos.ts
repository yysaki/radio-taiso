/** URL ハッシュに使う識別子。並び順がタブの順と連続再生の順になる */
export const slugs = ['daiichi', 'daini', 'minna'] as const

export type Slug = (typeof slugs)[number]

export type Video = {
  title: string
  /** タブの表示。狭い画面では区切りの位置でのみ折り返す */
  tabLabel: readonly string[]
  youtubeId: string
}

export const videos: Readonly<Record<Slug, Video>> = {
  daiichi: {
    title: 'ラジオ体操第一',
    tabLabel: ['ラジオ体操', '第一'],
    youtubeId: 'SGPBSqxKGAc',
  },
  daini: {
    title: 'ラジオ体操第二',
    tabLabel: ['ラジオ体操', '第二'],
    youtubeId: 'aHlNoTpXf_8',
  },
  minna: {
    title: 'みんなの体操',
    tabLabel: ['みんなの', '体操'],
    youtubeId: 'AlNMP0T0B3o',
  },
}

function isSlug(value: string): value is Slug {
  return (slugs as readonly string[]).includes(value)
}

/** ハッシュに対応する slug を返す。該当しなければ先頭 (第一) */
export function slugFromHash(hash: string): Slug {
  const slug = hash.replace(/^#/, '')
  return isSlug(slug) ? slug : slugs[0]
}

/** 連続再生で次に進む動画の slug。最後の動画なら undefined */
export function nextSlug(slug: Slug): Slug | undefined {
  return slugs[slugs.indexOf(slug) + 1]
}
