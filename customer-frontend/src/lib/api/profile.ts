// src/lib/api/profile.ts
import { apiClient } from './client';
import { Profile, ApiResponse } from './types';

export async function getProfile(): Promise<Profile> {
  const response = await apiClient.get<ApiResponse<Profile>>('me');
  return response.data.data;
}

export async function updateProfile(payload: {
  name?: string;
  email?: string;
  languagePreference?: 'en' | 'ar';
  location?: { latitude: number; longitude: number } | null;
}): Promise<Profile> {
  const response = await apiClient.put<ApiResponse<Profile>>('me', payload);
  return response.data.data;
}

/**
 * Persist the customer's GPS coordinates to the backend.
 * These coordinates are used by the matching engine for geospatial proximity scoring.
 */
export async function updateLocation(
  location: { latitude: number; longitude: number } | null,
): Promise<Profile> {
  const response = await apiClient.put<ApiResponse<Profile>>('me', { location });
  return response.data.data;
}

export async function deleteAccount(): Promise<{ message: string }> {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>('me');
  return response.data.data;
}

