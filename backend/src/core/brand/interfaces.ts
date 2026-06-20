import { IBranch } from '@/database/models/brand';
import { lang } from '../types';

export interface BrandData {
  logo: Buffer | string;
  name: lang;
  crn: string;
  tin: string;
  categories: string[];
  branches: IBranch[];
  tags?: string[];
  allowPayUsePOS: boolean;
}

export interface BrandResultInAdmin {
  id: string;
  logo: string;
  name: lang;
  crn: string;
  tin: string;
  categories: {
    name: lang;
    commissionPerRequest: number;
  }[];
  branches: IBranch[];
  tags: string[];
  allowPayUsePOS: boolean;
  completedRepairs: number;
  rating: number;
  ratingCount: number;
  approvedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrandResultInProvider {
  id: string;
  logo: string;
  name: lang;
  crn: string;
  tin: string;
  categories: {
    id: string;
    name: lang;
    commissionPerRequest: number;
  }[];
  branches: IBranch[];
  tags: string[];
  allowPayUsePOS: boolean;
  completedRepairs: number;
  rating: number;
  ratingCount: number;
}

export interface BrandResultInUser {
  id: string;
  logo: string;
  name: string;
  completedRepairs: number;
  rating: number;
  ratingCount: number;
}
