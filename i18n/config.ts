import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Define resources directly for this stage (Phase 0)
// In a full build, these might be loaded from public/locales
const resources = {
  en: {
    translation: {
      meta: {
        title: "ALL MAX MIND",
        description: "Architect Your Intelligence"
      },
      actions: {
        start: "Initiate Sequence",
        back: "Back",
        submit: "Analyze Vector",
        loading: "Processing..."
      },
      stages: {
        landing: {
          tagline: "Transform chaotic thoughts into structured strategic blueprints."
        },
        problem: {
          title: "Identify the Obstacle",
          placeholder: "e.g., I need to scale my engineering team..."
        }
      }
    }
  },
  pt: {
    translation: {
      meta: {
        title: "ALL MAX MIND",
        description: "Arquitetura de Inteligência"
      },
      actions: {
        start: "Iniciar Sequência",
        back: "Voltar",
        submit: "Analisar Vetor",
        loading: "Processando..."
      },
      stages: {
        landing: {
          tagline: "Transforme pensamentos caóticos em planos estratégicos estruturados."
        },
        problem: {
          title: "Identifique o Obstáculo",
          placeholder: "ex: Preciso escalar meu time de engenharia..."
        }
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: process.env.VITE_DEFAULT_LOCALE || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
