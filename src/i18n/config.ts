import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enCommon from './locales/en/common.json';
import enPhase2 from './locales/en/phase2.json';
import enPhase3 from './locales/en/phase3.json';
import enPhase4 from './locales/en/phase4.json';
import enEmail from './locales/en/email.json';

import ptBRCommon from './locales/pt-BR/common.json';
import ptBRPhase2 from './locales/pt-BR/phase2.json';
import ptBRPhase3 from './locales/pt-BR/phase3.json';
import ptBRPhase4 from './locales/pt-BR/phase4.json';
import ptBREmail from './locales/pt-BR/email.json';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'en-US': {
        common: enCommon,
        phase2: enPhase2,
        phase3: enPhase3,
        phase4: enPhase4,
        email: enEmail,
      },
      'pt-BR': {
        common: ptBRCommon,
        phase2: ptBRPhase2,
        phase3: ptBRPhase3,
        phase4: ptBRPhase4,
        email: ptBREmail,
      },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    lng: typeof navigator !== 'undefined' && navigator.language.startsWith('pt') ? 'pt-BR' : 'en-US',
    fallbackLng: 'en-US',
    debug: false,
    interpolation: {
      escapeValue: false, // React já faz escape
    },
  });

export default i18next;
