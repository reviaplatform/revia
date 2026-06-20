import { ApiError } from '../errors';

// Interface representing a result with an error
interface WithError {
  error: ApiError | unknown;
  result: null;
}

// Interface representing a result without an error
interface WithoutError<T> {
  error: null | unknown;
  result: T;
}

// Interface representing language translations
export interface lang {
  en: string; // English translation
  ar: string; // Arabic translation
}

// Interface representing location data with longitude and latitude
export interface locationData {
  longitude: number;
  latitude: number;
}

// Interface representing location data with name and coordinates
export interface locationDataWithName {
  en: string; // English name
  ar: string; // Arabic name
  longitude: number;
  latitude: number;
}

// Type representing a result that can either have an error or a successful result
export type SafeResult<T> = WithError | WithoutError<T>;

// Type representing an asynchronous safe result
export type AsyncSafeResult<T> = Promise<SafeResult<T>>;

export const PASSWORD_SALT_ROUNDS = 12;