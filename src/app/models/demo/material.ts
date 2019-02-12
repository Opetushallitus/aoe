import { File } from './file';

export interface Material {
  id: number;
  name: string;
  link?: string;
  file?: File;
}
