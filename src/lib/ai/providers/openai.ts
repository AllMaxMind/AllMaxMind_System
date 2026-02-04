import { BlueprintResponse, QuestionsResponse, AIOperationContext, setLastUsedProvider } from './index';

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

const getAPIKey = (): string => {
  const key = getEnvVar('OPENAI_API_KEY');
  if (!key) {
    throw new Error('OpenAI API Key missing. Please configure VITE_OPENAI_API_KEY.');
  }
  return key;
};

const getModel = (): string => {
  return getEnvVar('OPENAI_MODEL') || 'gpt-4-turbo';
};

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

async function callOpenAI(messages: OpenAIMessage[], responseFormat?: any): Promise<string> {
  const apiKey = getAPIKey();
  const model = getModel();

  const body: any = {
    model,
    messages,
    temperature: 0.7,
    max_tokens: 4000,
  };

  if (responseFormat) {
    body.response_format = responseFormat;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as OpenAIResponse;

  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Empty response from OpenAI');
  }

  return data.choices[0].message.content;
}

export async function generateQuestionsWithOpenAI(context: AIOperationContext): Promise<QuestionsResponse> {
  // Language support (P5)
  const language = context.language || 'pt-BR';
  const languageInstruction = language === 'pt-BR'
    ? 'Respond in Portuguese (Brazil). All text should be in Portuguese.'
    : 'Respond in English. All text should be in English.';
  const exampleLanguage = language === 'pt-BR' ? 'Portuguese' : 'English';

  const systemPrompt = `You are a Senior Technical Diagnostic Consultant.
Your goal is to generate 5 strategic questions to deepen the understanding of the client's problem.

RULES:
1. Questions must be investigative, seeking root causes or technical constraints.
2. Vary categories (Context, Process, Pain, Technical, Scale).
3. Be direct and professional.
4. Generate exactly 5 questions.
5. ${languageInstruction}

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "text": "Question text in ${exampleLanguage}",
      "category": "context|process|pain|technical|scale",
      "isCritical": true|false,
      "explanation": "Why this question is important",
      "example": "Example answer"
    }
  ]
}`;

  const userPrompt = `CONTEXT:
- Initial Problem: "${context.problemText}"
- Affected Dimensions: ${JSON.stringify(context.dimensions || [])}
- Intent Score: ${context.intentScore || 50}

Generate 5 diagnostic questions.`;

  try {
    const content = await callOpenAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { type: 'json_object' }
    );

    setLastUsedProvider('openai');
    return JSON.parse(content) as QuestionsResponse;
  } catch (error) {
    console.error('[OpenAI] Questions Error:', error);
    throw error;
  }
}

export async function generateBlueprintWithOpenAI(context: AIOperationContext): Promise<BlueprintResponse> {
  // Language support (P5)
  const language = context.language || 'pt-BR';
  const languageInstruction = language === 'pt-BR'
    ? 'Respond entirely in Portuguese (Brazil). Use BRL (R$) for currency.'
    : 'Respond entirely in English. Use USD ($) for currency.';
  const currencyExample = language === 'pt-BR' ? 'R$ 25.000 - R$ 35.000' : '$5,000 - $10,000';

  const systemPrompt = `You are a Senior Enterprise Solutions Architect.
Create a detailed, viable "Technical Blueprint" to solve the described problem.

GUIDELINES:
1. Be specific with technology suggestions (e.g., use "Supabase + React + n8n" instead of "Database and Frontend").
2. The "timelineEstimate" must be realistic for an MVP.
3. ${languageInstruction}

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "title": "Solution title",
  "executiveSummary": "High-level summary",
  "problemStatement": "Refined problem statement",
  "objectives": ["Objective 1", "Objective 2"],
  "technicalArchitecture": ["Tech 1", "Tech 2"],
  "keyFeatures": ["Feature 1", "Feature 2"],
  "timelineEstimate": "3-4 weeks",
  "projectSize": "small|medium|large",
  "estimatedInvestment": "${currencyExample}",
  "successMetrics": ["Metric 1", "Metric 2"],
  "risksAndMitigations": ["Risk -> Mitigation"],
  "nextSteps": ["Step 1", "Step 2"]
}`;

  const userPrompt = `CLIENT CONTEXT:
- Problem: ${context.problemText}
- Estimated Complexity: ${context.complexity || 'medium'}
- Affected Dimensions: ${JSON.stringify(context.dimensions || [])}
- Technical Details (Q&A): ${JSON.stringify(context.answers || [])}

Generate a comprehensive technical blueprint.`;

  try {
    const content = await callOpenAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { type: 'json_object' }
    );

    setLastUsedProvider('openai');
    return JSON.parse(content) as BlueprintResponse;
  } catch (error) {
    console.error('[OpenAI] Blueprint Error:', error);
    throw error;
  }
}

export async function generateEmbeddingWithOpenAI(text: string): Promise<number[]> {
  const apiKey = getAPIKey();

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI Embeddings error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}
