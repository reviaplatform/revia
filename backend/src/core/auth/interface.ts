import { lang, locationData } from '../types';

export interface AdminLogin {
  email: string;
  password: string;
  languagePreference: 'en' | 'ar';
}

export interface AdminAuthResponse {
  id: string;
  accessToken: string;
  accessTokenExpireTime: Date;
  name: string;
  phoneNumber: string;
  email: string;
  languagePreference: 'ar' | 'en';
  role: string;
  lastLoginAt: string;
  deletedAt: string | null;
  createdAt: string;
}

export interface CustomerAuthResponse {
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
  accessToken: string;
  refreshToken: string;
  accessTokenExpireTime: Date;
  refreshTokenExpireTime: Date;
}

export interface ProviderLogin {
  phoneNumber: string;
  password: string;
  languagePreference: 'en' | 'ar';
}

export interface ProviderSignup {
  languagePreference: 'en' | 'ar';
  providerData: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
  };
  brandData: {
    logo: Buffer;
    name: lang;
    crn: string;
    tin: string;
    categories: string[];
    branches: {
      name: lang;
      location: locationData;
      isActive: boolean;
    }[];
    allowPayUsePOS: boolean;
  };
}

export interface ProviderAuthResponse {
  id: string;
  accessToken: string;
  accessTokenExpireTime: Date;
  name: string;
  email: string;
  phoneNumber: string;
  deletedAt: string | null;
  role: string;
  brand: lang | null;
  languagePreference: 'en' | 'ar';
  createdAt: string;
  lastLoginAt: string;
}
