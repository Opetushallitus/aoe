export interface Subtitle {
  src: string;
  default: boolean;
  kind: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
  label: string;
  srclang: string;
}
