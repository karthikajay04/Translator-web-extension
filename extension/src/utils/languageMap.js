// Language name to locale code mapping
export const LANGUAGE_MAP = {
  "English": "en",
  "Hindi": "hi",
  "Tamil": "ta",
  "Telugu": "te",
  "Kannada": "kn",
  "Malayalam": "ml",
  "Spanish": "es",
  "French": "fr"
};

// Reverse mapping: locale code to language name
export const LOCALE_TO_NAME = {
  "en": "English",
  "hi": "Hindi",
  "ta": "Tamil",
  "te": "Telugu",
  "kn": "Kannada",
  "ml": "Malayalam",
  "es": "Spanish",
  "fr": "French"
};

// Get locale code from language name
export function getLocaleCode(languageName) {
  return LANGUAGE_MAP[languageName] || "en";
}

// Get language name from locale code
export function getLanguageName(localeCode) {
  return LOCALE_TO_NAME[localeCode] || "English";
}

