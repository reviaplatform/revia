import { lang } from '../types';

export interface CategoryData {
  name: lang;
  commissionPerRequest: number;
}

export interface CategoryResult {
  id: string;
  name: lang;
  commissionPerRequest: number;
  isActive: boolean;
}
