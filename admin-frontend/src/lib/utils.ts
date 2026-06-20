import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Maps technical error strings to clear, user-friendly messages.
 */
export function formatErrorMessage(error: string | Error): string {
  const message = typeof error === "string" ? error : error.message;

  const errorMap: Record<string, string> = {
    "invalidAccessToken": "Your session has expired. Please log in again.",
    "Forbidden": "You don't have permission to view this data.",
    "Unauthorized": "Please log in to continue.",
    "Internal Server Error": "We're experiencing server issues. Please try again later.",
    "Failed to fetch": "Could not connect to the server. Please check your internet connection.",
    "invalidCredentials": "The email or password you entered is incorrect.",
    "accountDisabled": "This account has been disabled. Please contact support.",
  };

  // Case-insensitive search for keys in the map
  const foundKey = Object.keys(errorMap).find(key => 
    message.toLowerCase().includes(key.toLowerCase())
  );

  return foundKey ? errorMap[foundKey] : message;
}





