import * as Sentry from "@sentry/react";

// Safely access environment variables
const getEnvVar = (key: string) => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {}
  return undefined;
};

export const initSentry = () => {
  const dsn = getEnvVar('VITE_SENTRY_DSN');
  const appVersion = getEnvVar('VITE_APP_VERSION') || '1.0.0';
  const environment = getEnvVar('NODE_ENV') || 'production';

  // Only init if DSN is available
  if (!dsn) return;

  Sentry.init({
    dsn: dsn,
    environment: environment,
    release: `all-max-mind@${appVersion}`,
    beforeSend(event) {
      // Filtrar eventos sensíveis
      if (event.request?.url?.includes('password') || event.request?.url?.includes('token')) {
        return null;
      }

      // Anonimizar dados do usuário
      if (event.user) {
        event.user = {
          ...event.user,
          email: undefined,
          ip_address: undefined
        };
      }

      return event;
    }
  });

  // Capturar erros não tratados
  window.addEventListener('unhandledrejection', (event) => {
    Sentry.captureException(event.reason);
  });

  window.addEventListener('error', (event) => {
    Sentry.captureException(event.error);
  });
};

// Helper para capturar erros com contexto
export const captureError = (error: Error, context?: Record<string, any>) => {
  console.error('[Error]', error, context);
  
  const dsn = getEnvVar('VITE_SENTRY_DSN');

  if (dsn) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      
      // Adicionar contexto do usuário
      const visitorId = localStorage.getItem('am_visitor_id');
      if (visitorId) {
        scope.setUser({ id: visitorId });
      }
      
      Sentry.captureException(error);
    });
  }
};

// Performance monitoring
export const startTransaction = (name: string) => {
  // Basic transaction tracking
  return {
    finish: () => {
      console.log(`[Sentry] Transaction: ${name}`);
    }
  };
};