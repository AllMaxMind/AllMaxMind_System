import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MODEL_CONFIG_TEXT, MODEL_CONFIG_REASONING } from "../constants";

// Initialize Gemini Client
// Note: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Validates if the API key is present.
 */
export const isGeminiConfigured = (): boolean => {
  return !!process.env.API_KEY;
};

/**
 * Basic text generation for problem structuring
 */
export const generateStructuralAnalysis = async (problemStatement: string): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_CONFIG_TEXT,
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

/**
 * Deep reasoning for Blueprint generation
 * Uses the Pro model for complex reasoning.
 */
export const generateBlueprint = async (data: any): Promise<string> => {
   if (!process.env.API_KEY) throw new Error("API Key missing");
   
   // This would be expanded in later stages (Etapa 6/7)
   try {
     const response: GenerateContentResponse = await ai.models.generateContent({
        model: MODEL_CONFIG_REASONING,
        contents: `Create a strategic blueprint based on: ${JSON.stringify(data)}`,
        config: {
          thinkingConfig: { thinkingBudget: 1024 } // Enable thinking for better blueprint
        }
     });
     return response.text || "";
   } catch (error) {
     console.error("Gemini Blueprint Error:", error);
     throw error;
   }
}
