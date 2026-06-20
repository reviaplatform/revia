import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTranslation(val: any, lang: string): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val[lang] || val["en"] || Object.values(val)[0] || "";
  }
  return String(val);
}
