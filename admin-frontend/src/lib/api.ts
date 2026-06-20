import { formatErrorMessage } from "./utils";

export type LanguagePreference = "en" | "ar" | string;

export interface LoginPayload {
  email: string;
  password: string;
  languagePreference?: LanguagePreference;
}

export interface ForgotPasswordPayload {
  email: string;
  languagePreference?: LanguagePreference;
}

export interface VerifyPasswordOtpPayload {
  email: string;
  otp: string;
  languagePreference?: LanguagePreference;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  languagePreference?: LanguagePreference;
}
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * A custom fetch wrapper that automatically handles JSON headers
 * and throws errors for non-2xx responses.
 */
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers as any,
  };

  // Inject Authorization token if it exists (only in browser environment)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, { ...options, headers });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    // Handling cases where backend returns 200 without JSON
    if (!response.ok) {
      throw new Error("An unexpected error occurred.");
    }
    return {} as T;
  }

  if (!response.ok) {
    // Attempt defensive error parsing based on standard conventions
    const rawMessage =
      data?.message ||
      data?.data?.message ||
      (data?.error && typeof data.error === "object" ? data.error.message : data?.error) ||
      `Request failed with status ${response.status}`;
    
    throw new Error(formatErrorMessage(rawMessage));
  }

  return data as T;
}

export const api = {
  login: (payload: LoginPayload) =>
    apiFetch<{ data?: { accessToken?: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiFetch<{ message?: string; data?: any }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyPasswordOtp: (payload: VerifyPasswordOtpPayload) =>
    apiFetch<{ message?: string; data?: any }>("/auth/verify-password-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiFetch<{ message?: string; data?: any }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
