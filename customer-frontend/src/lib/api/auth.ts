// src/lib/api/auth.ts
import { apiClient } from './client';
import { AuthSession, OtpResponse, PreRegToken, ApiResponse } from './types';

// Stubs for Phase 1

export async function sendOtp(phoneNumber: string, languagePreference: "en" | "ar"): Promise<OtpResponse> {
  const response = await apiClient.post<ApiResponse<OtpResponse>>('auth/send-otp', {
    phoneNumber,
    languagePreference,
  });
  return response.data.data;
}

export async function validateExistUserOtp(phoneNumber: string, otp: string, languagePreference: "en" | "ar"): Promise<AuthSession> {
  const response = await apiClient.post<ApiResponse<AuthSession>>('auth/validate-exist-user-otp', {
    phoneNumber,
    otp,
    languagePreference,
  });
  return response.data.data;
}

export async function validateNotExistUserOtp(phoneNumber: string, otp: string, languagePreference: "en" | "ar"): Promise<PreRegToken> {
  const response = await apiClient.post<ApiResponse<PreRegToken>>('auth/validate-notexist-user-otp', {
    phoneNumber,
    otp,
    languagePreference,
  });
  return response.data.data;
}

export async function register(payload: { name: string; gender: "male" | "female"; email: string; birthday: string; languagePreference: "en" | "ar" }, registerToken: string): Promise<AuthSession> {
  const response = await apiClient.post<ApiResponse<AuthSession>>('auth/register', payload, {
    headers: {
      Authorization: `Bearer ${registerToken}`
    }
  });
  return response.data.data;
}

export async function refreshToken(): Promise<AuthSession> {
  const response = await apiClient.get<ApiResponse<AuthSession>>('auth/refresh', {
    withCredentials: true // Ensures HttpOnly cookie is sent
  });
  return response.data.data;
}
