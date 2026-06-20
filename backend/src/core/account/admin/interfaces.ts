export interface AdminData {
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  password: string;
}

export interface AdminResult {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  languagePreference: 'ar' | 'en';
  role: string;
  lastLoginAt: string;
  deletedAt: string | null;
  createdAt: string;
}
