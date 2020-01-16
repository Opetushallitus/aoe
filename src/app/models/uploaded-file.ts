import { Subtitle } from './subtitle';

export interface UploadedFile {
  id: number;
  file: string;
  language: string;
  link: string;
  displayName: {
    fi: string;
    sv: string;
    en: string;
  };
  subtitles?: Subtitle[];
}
