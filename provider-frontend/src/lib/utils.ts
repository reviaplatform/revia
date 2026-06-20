import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Egyptian mobile numbers: 11 digits, starting with 010, 011, 012 or 015
export const EGYPT_PHONE_REGEX = /^(010|011|012|015)\d{8}$/

export function isValidEgyptPhone(phoneNumber: string) {
  return EGYPT_PHONE_REGEX.test(phoneNumber)
}
