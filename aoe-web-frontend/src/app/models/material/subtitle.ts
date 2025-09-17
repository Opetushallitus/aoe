export interface Subtitle {
  id: string
  fileId: string
  subtitle: string
  default: boolean
  kind: SubtitleKind
  label: string
  srclang: string
}

export enum SubtitleKind {
  subtitles = 'subtitles',
  captions = 'captions',
  descriptions = 'descriptions',
  chapters = 'chapters',
  metadata = 'metadata'
}
