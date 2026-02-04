import {
  callAIWithFallback,
  AIOperationContext,
  BlueprintResponse,
  QuestionsResponse,
  AIProvider,
  getLastUsedProvider,
} from './index';
import { generateQuestionsWithGemini, generateBlueprintWithGemini } from './gemini';
import { generateQuestionsWithOpenAI, generateBlueprintWithOpenAI } from './openai';

/**
 * Generate adaptive questions with automatic fallback
 */
export async function generateAdaptiveQuestionsWithFallback(
  context: AIOperationContext
): Promise<QuestionsResponse> {
  return callAIWithFallback(async (provider: AIProvider) => {
    if (provider === 'gemini') {
      return generateQuestionsWithGemini(context);
    } else {
      return generateQuestionsWithOpenAI(context);
    }
  });
}

/**
 * Generate technical blueprint with automatic fallback
 */
export async function generateBlueprintWithFallback(
  context: AIOperationContext
): Promise<BlueprintResponse> {
  return callAIWithFallback(async (provider: AIProvider) => {
    if (provider === 'gemini') {
      return generateBlueprintWithGemini(context);
    } else {
      return generateBlueprintWithOpenAI(context);
    }
  });
}

/**
 * Get which provider was used for the last operation
 */
export { getLastUsedProvider };
