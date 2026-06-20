export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    gender: 'male' | 'female' | 'other';
    birthday: string;
    languagePreference: 'en' | 'ar';
    picture?: string;
}

export interface UpdateProfileRequest {
    name?: string;
    email?: string;
    phoneNumber?: string;
    gender?: 'male' | 'female' | 'other';
    birthday?: string;
    languagePreference?: 'en' | 'ar';
    picture?: File; // For multipart upload
}

export interface ProfileResponse {
    message: string;
    data: UserProfile;
}
