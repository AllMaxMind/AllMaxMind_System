import { AIProvider, AIProviderError, BlueprintResponse, QuestionsResponse, AIOperationContext } from './types';

export * from './types';

export interface AIConfig {
  primaryProvider: AIProvider;
  fallbackProvider: AIProvider;
  retryAttempts: number;
  retryDelayMs: number;
  timeout: number;
}

const DEFAULT_CONFIG: AIConfig = {
  primaryProvider: 'gemini',
  fallbackProvider: 'openai',
  retryAttempts: 2,
  retryDelayMs: 1000,
  timeout: 30000,
};

// Helper function for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function for timeout
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
};

// Get provider configuration from environment
export const getProviderConfig = (): AIConfig => {
  const env = (import.meta as any).env || {};

  return {
    primaryProvider: (env.VITE_PRIMARY_AI_PROVIDER as AIProvider) || 'gemini',
    fallbackProvider: (env.VITE_FALLBACK_AI_PROVIDER as AIProvider) || 'openai',
    retryAttempts: parseInt(env.VITE_AI_RETRY_ATTEMPTS || '2', 10),
    retryDelayMs: parseInt(env.VITE_AI_RETRY_DELAY_MS || '1000', 10),
    timeout: parseInt(env.VITE_AI_TIMEOUT_MS || '30000', 10),
  };
};

// Check if OpenAI is available
export const isOpenAIConfigured = (): boolean => {
  const env = (import.meta as any).env || {};
  return !!(env.VITE_OPENAI_API_KEY || env.OPENAI_API_KEY);
};

// Check if Gemini is available
export const isGeminiConfigured = (): boolean => {
  const env = (import.meta as any).env || {};
  return !!(env.VITE_API_KEY || env.API_KEY);
};

// Main fallback wrapper
export async function callAIWithFallback<T>(
  operation: (provider: AIProvider) => Promise<T>,
  config: AIConfig = getProviderConfig()
): Promise<T> {
  const errors: Error[] = [];

  // Try primary provider with retries
  for (let attempt = 0; attempt < config.retryAttempts; attempt++) {
    try {
      console.log(`[AI] Attempting ${config.primaryProvider} (attempt ${attempt + 1}/${config.retryAttempts})`);

      const result = await withTimeout(operation(config.primaryProvider), config.timeout);

      console.log(`[AI] ${config.primaryProvider} succeeded`);
      return result;
    } catch (error: any) {
      console.warn(`[AI] ${config.primaryProvider} attempt ${attempt + 1} failed:`, error.message);
      errors.push(error);

      if (attempt < config.retryAttempts - 1) {
        console.log(`[AI] Waiting ${config.retryDelayMs}ms before retry...`);
        await delay(config.retryDelayMs);
      }
    }
  }

  // Check if fallback is available
  if (config.fallbackProvider === 'openai' && !isOpenAIConfigured()) {
    console.warn('[AI] OpenAI fallback not configured, skipping');
    throw new AIProviderError(
      `Primary provider (${config.primaryProvider}) failed after ${config.retryAttempts} attempts. Fallback not available.`,
      config.primaryProvider,
      errors[errors.length - 1]
    );
  }

  // Fallback to secondary provider
  try {
    console.log(`[AI] Falling back to ${config.fallbackProvider}`);

    const result = await withTimeout(operation(config.fallbackProvider), config.timeout);

    console.log(`[AI] ${config.fallbackProvider} succeeded`);
    return result;
  } catch (error: any) {
    console.error(`[AI] Fallback ${config.fallbackProvider} also failed:`, error.message);
    errors.push(error);

    throw new AIProviderError(
      `All AI providers failed. Last error: ${error.message}`,
      config.fallbackProvider,
      error
    );
  }
}

// Log which provider was used for analytics
let lastUsedProvider: AIProvider | null = null;

export const getLastUsedProvider = (): AIProvider | null => lastUsedProvider;

export const setLastUsedProvider = (provider: AIProvider): void => {
  lastUsedProvider = provider;
};
