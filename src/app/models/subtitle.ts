export interface Subtitle {
  filepath: string;
  default: boolean;
  kind: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
  label: string;
  srclang: string;
  materialId: string;
}
