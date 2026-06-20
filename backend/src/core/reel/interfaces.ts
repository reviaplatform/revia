import { lang } from '../types';

export interface ReelData {
  video: Buffer;
  thumbnail: Buffer;
  caption: lang;
  isVisible?: boolean;
}

export interface ReelResult {
  id: string;
  video: string;
  thumbnail: string;
  caption: lang;
  tags: string[];
  likesCount: number;
  viewsCount: number;
  isVisible: boolean;
  isLiked?: boolean;
  brand?: {
    id: string;
    name: lang;
    logo: string;
  };
  createdAt: string;
}
