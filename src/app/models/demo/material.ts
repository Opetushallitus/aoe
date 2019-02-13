import { File } from './file';

/**
 * Material model
 */
export interface Material {
  id?: number;
  name?: string;
  link?: string;
  file: File;
}
