import { lang } from "@/core/types";

export interface ProviderData {
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  password: string;
  brandId: string;
  languagePreference: 'en' | 'ar';
}

export interface ProviderResult {
  id: string;
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
