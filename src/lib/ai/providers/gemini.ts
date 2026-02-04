import { GoogleGenAI, Schema, Type } from '@google/genai';
import { BlueprintResponse, QuestionsResponse, AIOperationContext, AdaptiveQuestion, setLastUsedProvider } from './index';
import { MODEL_CONFIG_TEXT, MODEL_CONFIG_REASONING } from '../../../constants';

// Helper to access env vars safely
const getEnvVar = (key: string): string | undefined => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key] || (import.meta as any).env[`VITE_${key}`];
    }
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || process.env[`VITE_${key}`];
    }
  } catch (e) {
    // Silently fail
  }
  return undefined;
};

// Check for API Key
const apiKey = getEnvVar('API_KEY');

// Initialize Gemini Client
const getAI = () => {
  if (!apiKey) {
    const errorMsg = 'Gemini API Key missing. Please configure VITE_API_KEY in your .env file. Get your key at: https://aistudio.google.com/app/apikey';
    console.error('[Gemini]', errorMsg);
    throw new Error(errorMsg);
  }
  return new GoogleGenAI({ apiKey });
};

// Schemas
const questionsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING, description: 'The question to ask the user.' },
          category: {
            type: Type.STRING,
            enum: ['context', 'process', 'pain', 'technical', 'scale'],
            description: 'Question category.',
          },
          isCritical: { type: Type.BOOLEAN, description: 'If this question is fundamental for scoping.' },
          explanation: { type: Type.STRING, description: 'Brief explanation of why we are asking this.' },
          example: { type: Type.STRING, description: 'An example answer to guide the user.' },
        },
        required: ['text', 'category', 'isCritical', 'explanation', 'example'],
      },
    },
  },
};

const blueprintSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'A compelling commercial and technical title for the solution.' },
    executiveSummary: { type: Type.STRING, description: 'High-level executive summary focused on business value.' },
    problemStatement: { type: Type.STRING, description: 'Refined technical problem statement.' },
    objectives: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of 3-5 clear objectives.',
    },
    technicalArchitecture: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of stack technologies and components.',
    },
    keyFeatures: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of main MVP features.',
    },
    timelineEstimate: { type: Type.STRING, description: "e.g., '3-4 weeks'" },
    projectSize: { type: Type.STRING, enum: ['small', 'medium', 'large'] },
    estimatedInvestment: { type: Type.STRING, description: "e.g., 'R$ 25.000 - R$ 35.000'" },
    successMetrics: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'KPIs to measure success.',
    },
    risksAndMitigations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Format: 'Risk: Explanation -> Mitigation: Action'",
    },
    nextSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Immediate next steps to start the project.',
    },
  },
  required: [
    'title',
    'executiveSummary',
    'problemStatement',
    'objectives',
    'technicalArchitecture',
    'keyFeatures',
    'timelineEstimate',
    'projectSize',
    'estimatedInvestment',
    'successMetrics',
    'risksAndMitigations',
    'nextSteps',
  ],
};

export async function generateQuestionsWithGemini(context: AIOperationContext): Promise<QuestionsResponse> {
  const ai = getAI();

  // Language support (P5)
  const language = context.language || 'pt-BR';
  const languageInstruction = language === 'pt-BR'
    ? 'Respond in Portuguese (Brazil).'
    : 'Respond in English.';

  const systemInstruction = `You are a Senior Technical Diagnostic Consultant.
Your goal is to generate 5 strategic questions to deepen the understanding of the client's problem.

RULES:
1. Questions must be investigative, seeking root causes or technical constraints.
2. Vary categories (Context, Process, Pain, Technical, Scale).
3. Be direct and professional.
4. Generate exactly 5 questions.
5. ${languageInstruction}`;

  const userPrompt = `CONTEXT:
- Initial Problem: "${context.problemText}"
- Affected Dimensions: ${JSON.stringify(context.dimensions || [])}
- Intent Score: ${context.intentScore || 50}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: questionsSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error('Empty response from Gemini');

    setLastUsedProvider('gemini');
    return JSON.parse(text) as QuestionsResponse;
  } catch (error) {
    console.error('[Gemini] Questions Error:', error);
    throw error;
  }
}

export async function generateBlueprintWithGemini(context: AIOperationContext): Promise<BlueprintResponse> {
  const ai = getAI();

  // Language support (P5)
  const language = context.language || 'pt-BR';
  const languageInstruction = language === 'pt-BR'
    ? 'Respond entirely in Portuguese (Brazil). Use BRL (R$) for currency.'
    : 'Respond entirely in English. Use USD ($) for currency.';

  const systemInstruction = `You are a Senior Enterprise Solutions Architect.
Create a detailed, viable "Technical Blueprint" to solve the described problem.

GUIDELINES:
1. Be specific with technology suggestions (e.g., use "Supabase + React + n8n" instead of "Database and Frontend").
2. The "timelineEstimate" must be realistic for an MVP.
3. ${languageInstruction}`;

  const userPrompt = `CLIENT CONTEXT:
- Problem: ${context.problemText}
- Estimated Complexity: ${context.complexity || 'medium'}
- Affected Dimensions: ${JSON.stringify(context.dimensions || [])}
- Technical Details (Q&A): ${JSON.stringify(context.answers || [])}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_CONFIG_REASONING.model,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: blueprintSchema,
        thinkingConfig: { thinkingBudget: 1024 },
      },
    });

    const text = response.text;
    if (!text) throw new Error('Empty response from Gemini');

    setLastUsedProvider('gemini');
    return JSON.parse(text) as BlueprintResponse;
  } catch (error) {
    console.error('[Gemini] Blueprint Error:', error);
    throw error;
  }
}

export async function generateEmbeddingWithGemini(text: string): Promise<number[]> {
  const ai = getAI();

  try {
    const model = ai.models.embedContent
      ? ai
      : { models: { embedContent: async () => ({ embedding: { values: [] } }) } };

    // Note: This is a simplified version. The actual Gemini embedding API may differ.
    const response = await ai.models.generateContent({
      model: 'text-embedding-004',
      contents: text,
    });

    // For embedding models, this would be different
    return [];
  } catch (error) {
    console.error('[Gemini] Embedding Error:', error);
    throw error;
  }
}

/**
 * @deprecated DO NOT USE FROM FRONTEND
 *
 * This function was removed because it requires exposing the Gemini API key
 * to the browser, which is a security vulnerability.
 *
 * USE INSTEAD: improveProblemTextWithAI() from lib/supabase/problems.ts
 * This calls the secure Edge Function that keeps the API key on the server.
 *
 * @see supabase/functions/improve-problem-text/index.ts
 */
export async function improveProblemTextWithGemini(_userText: string): Promise<string> {
  throw new Error(
    '[SECURITY] improveProblemTextWithGemini is deprecated. ' +
    'Use improveProblemTextWithAI() from lib/supabase/problems.ts instead. ' +
    'API keys must never be exposed to the browser.'
  );
}
