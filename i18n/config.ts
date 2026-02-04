import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations from src/i18n/locales
import enCommon from '../src/i18n/locales/en/common.json';
import enLanding from '../src/i18n/locales/en/landing.json';
import enPhase2 from '../src/i18n/locales/en/phase2.json';
import enPhase3 from '../src/i18n/locales/en/phase3.json';
import enPhase4 from '../src/i18n/locales/en/phase4.json';
import enEmail from '../src/i18n/locales/en/email.json';

import ptBRCommon from '../src/i18n/locales/pt-BR/common.json';
import ptBRLanding from '../src/i18n/locales/pt-BR/landing.json';
import ptBRPhase2 from '../src/i18n/locales/pt-BR/phase2.json';
import ptBRPhase3 from '../src/i18n/locales/pt-BR/phase3.json';
import ptBRPhase4 from '../src/i18n/locales/pt-BR/phase4.json';
import ptBREmail from '../src/i18n/locales/pt-BR/email.json';

// Get saved language or detect from browser
const getSavedLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('language');
    if (saved && ['en-US', 'pt-BR'].includes(saved)) {
      return saved;
    }
  }
  if (typeof navigator !== 'undefined' && navigator.language.startsWith('pt')) {
    return 'pt-BR';
  }
  return 'en-US';
};

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'en-US': {
        common: enCommon,
        landing: enLanding,
        phase2: enPhase2,
        phase3: enPhase3,
        phase4: enPhase4,
        email: enEmail,
      },
      'pt-BR': {
        common: ptBRCommon,
        landing: ptBRLanding,
        phase2: ptBRPhase2,
        phase3: ptBRPhase3,
        phase4: ptBRPhase4,
        email: ptBREmail,
      },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
    lng: getSavedLanguage(),
    fallbackLng: 'en-US',
    supportedLngs: ['en-US', 'pt-BR'],
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false, // Prevent loading flicker
      bindI18n: 'languageChanged loaded', // Listen to language changes
      bindI18nStore: 'added removed', // Listen to store changes
    },
  });

export default i18next;
