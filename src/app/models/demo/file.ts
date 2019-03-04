/**
 * File model
 */
export interface File {
  filePath?: string;
  originalFilename: string;
  fileSize?: number;
  mimeType: string;
  format: string;
  subtitles?: Subtitle[];
}

export interface Subtitle {
  lang: string;
  label: string;
  filePath: string;
  default?: boolean;
}
