import { Keyword } from '../keyword';

export interface CollectionCard {
  id: string;
  name: string;
  thumbnail: string | null;
  authors: string[];
  description: string;
  keywords: Keyword[];
}
