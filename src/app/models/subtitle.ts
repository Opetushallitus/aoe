export interface Subtitle {
  id?: number;
  src: string;
  default: boolean;
  kind: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
  label: string;
  srclang: string;
}
