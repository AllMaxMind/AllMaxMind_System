
import { GoogleGenAI, Schema, Type } from "@google/genai";
import { MODEL_CONFIG_TEXT, MODEL_CONFIG_REASONING } from "../constants";

// Helper to access env vars safely
const getEnvVar = (key: string) => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key] || (import.meta as any).env[`VITE_${key}`];
    }
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || process.env[`VITE_${key}`];
    }
  } catch (e) {}
  return undefined;
};

// Check for API Key
const apiKey = getEnvVar('API_KEY');
if (!apiKey) {
  console.error("CRITICAL: API_KEY is missing. AI features will fail.");
}

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: apiKey || 'missing-key' });

export const isGeminiConfigured = (): boolean => {
  return !!apiKey;
};

// --- SCHEMAS ---

const questionsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING, description: "The question to ask the user." },
          category: { 
            type: Type.STRING, 
            enum: ["context", "process", "pain", "technical", "scale"],
            description: "Question category."
          },
          isCritical: { type: Type.BOOLEAN, description: "If this question is fundamental for scoping." },
          explanation: { type: Type.STRING, description: "Brief explanation of why we are asking this." },
          example: { type: Type.STRING, description: "An example answer to guide the user." }
        },
        required: ["text", "category", "isCritical", "explanation", "example"]
      }
    }
  }
};

const blueprintSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A compelling commercial and technical title for the solution." },
    executiveSummary: { type: Type.STRING, description: "High-level executive summary focused on business value." },
    problemStatement: { type: Type.STRING, description: "Refined technical problem statement." },
    objectives: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "List of 3-5 clear objectives." 
    },
    technicalArchitecture: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "List of stack technologies and components." 
    },
    keyFeatures: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "List of main MVP features." 
    },
    timelineEstimate: { type: Type.STRING, description: "e.g., '3-4 weeks'" },
    projectSize: { type: Type.STRING, enum: ["small", "medium", "large"] },
    estimatedInvestment: { type: Type.STRING, description: "e.g., 'R$ 25.000 - R$ 35.000'" },
    successMetrics: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "KPIs to measure success." 
    },
    risksAndMitigations: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "Format: 'Risk: Explanation -> Mitigation: Action'" 
    },
    nextSteps: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "Immediate next steps to start the project." 
    }
  },
  required: [
    "title", "executiveSummary", "problemStatement", "objectives", 
    "technicalArchitecture", "keyFeatures", "timelineEstimate", 
    "projectSize", "estimatedInvestment", "successMetrics", 
    "risksAndMitigations", "nextSteps"
  ]
};

// --- FUNCTIONS ---

export const generateStructuralAnalysis = async (problemStatement: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_CONFIG_TEXT.model,
      contents: `Analyze the following problem statement and break it down into 3 core constituent dimensions.
      Problem: "${problemStatement}"
      Return only the dimensions.`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const generateAdaptiveQuestions = async (context: any): Promise<any> => {
  if (!apiKey) throw new Error("API Key missing");

  // Language support - respect user's selected language
  const language = context.language || 'pt-BR';
  const languageInstruction = language === 'pt-BR'
    ? 'Respond entirely in Portuguese (Brazil). All questions, explanations, and examples must be in Portuguese.'
    : 'Respond entirely in English. All questions, explanations, and examples must be in English.';

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
- Affected Dimensions: ${JSON.stringify(context.dimensions)}
- Intent Score: ${context.intentScore}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest', 
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: questionsSchema
      }
    });

    const text = response.text;
    return text ? JSON.parse(text) : { questions: [] };
  } catch (error) {
    console.error("Gemini Questions Error:", error);
    throw error;
  }
};

export const generateBlueprint = async (data: any): Promise<any> => {
   if (!apiKey) throw new Error("API Key missing");

   // Language support - respect user's selected language
   const language = data.language || 'pt-BR';
   const languageInstruction = language === 'pt-BR'
     ? 'Respond entirely in Portuguese (Brazil). Use BRL (R$) for currency. All fields must be in Portuguese.'
     : 'Respond entirely in English. Use USD ($) for currency. All fields must be in English.';

   const systemInstruction = `You are a Senior Enterprise Solutions Architect.
Create a detailed, viable "Technical Blueprint" to solve the described problem.

GUIDELINES:
1. Be specific with technology suggestions (e.g., use "Supabase + React + n8n" instead of "Database and Frontend").
2. The "timelineEstimate" must be realistic for an MVP.
3. ${languageInstruction}`;

   const userPrompt = `CLIENT CONTEXT:
- Problem: ${data.problemText}
- Estimated Complexity: ${data.complexity}
- Affected Dimensions: ${JSON.stringify(data.dimensions)}
- Technical Details (Q&A): ${JSON.stringify(data.answers)}`;

   try {
     const response = await ai.models.generateContent({
        model: MODEL_CONFIG_REASONING.model,
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: blueprintSchema,
          thinkingConfig: { thinkingBudget: 1024 }
        }
     });
     
     const text = response.text;
     if (!text) throw new Error("Empty response from Gemini");
     
     return JSON.parse(text);
   } catch (error) {
     console.error("Gemini Blueprint Error:", error);
     throw error;
   }
}
