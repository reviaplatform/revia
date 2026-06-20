import { CustomerGender } from "@/database/models/customer";

export interface CustomerData {
  name: string;
  picture?: Buffer | string;
  phoneNumber: string;
  email?: string;
  languagePreference: 'ar' | 'en';
  gender: CustomerGender;
  birthday?: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface CustomerResult {
  id: string;
  name: string;
  picture: string | null;
  status: string;
  phoneNumber: string;
  email: string | null;
  languagePreference: 'ar' | 'en';
  gender: string;
  birthday: string | null;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  deletedAt: string | null;
  lastLoginAt: string;
  createdAt: string;
}
