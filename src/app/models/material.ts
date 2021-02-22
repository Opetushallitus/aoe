import { Subtitle } from './subtitle';

export interface Material {
  id?: string;
  language: string;
  priority: number;
  filepath?: string;
  originalfilename?: string;
  filekey?: string;
  link?: string;
  mimetype?: string;
  displayName: {
    fi: string;
    sv: string;
    en: string;
  };
  subtitles?: Subtitle[];
  downloadUrl?: string;
}
