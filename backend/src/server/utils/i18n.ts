import * as i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { join } from 'path';

// Initialize i18next with filesystem backend
i18next.use(Backend).init({
  lng: 'en', // Default language
  defaultNS: 'translation', // Default namespace
  fallbackLng: 'en', // Fallback language if the current language is not available
  backend: {
    loadPath: join(__dirname, '..', '..', '..', 'locales', '{{lng}}', '{{ns}}.json'), // Path to the translation files
  },
  interpolation: {
    escapeValue: false, // Disable escaping for interpolation
  },
});

// Function to change the current language
export async function changeI18Language(language: string) {
  await i18next.changeLanguage(language);
}

// Function to get a message from the 'message' namespace
export function getI18Message(key: string): string {
  return i18next.t(`message.${key}`);
}

// Function to get a validation message from the 'validation' namespace
export function getI18ValidationMessage(key: string): string {
  return i18next.t(`validation.${key}`);
}

export default i18next;
