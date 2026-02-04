import { DimensionSelection } from '../supabase/dimensions';
import { QuestionAnswer } from '../supabase/answers';
import { generateBlueprintWithFallback, getLastUsedProvider } from './providers/api';

export interface BlueprintInput {
  problemText: string;
  dimensions: DimensionSelection[];
  questionsAnswers: QuestionAnswer[];
  complexity: 'small' | 'medium' | 'large';
  language?: 'en' | 'pt-BR';
}

export interface Blueprint {
  id: string;
  title: string;
  executiveSummary: string;
  problemStatement: string;
  objectives: string[];
  technicalArchitecture: string[];
  keyFeatures: string[];
  timelineEstimate: string;
  projectSize: 'small' | 'medium' | 'large';
  estimatedInvestment: string;
  successMetrics: string[];
  risksAndMitigations: string[];
  nextSteps: string[];
  createdAt: Date;
  generatedBy?: 'gemini' | 'openai';
}

export const generateTechnicalBlueprint = async (input: BlueprintInput): Promise<Blueprint> => {
    console.log('[Blueprint] Invoking AI with fallback support...');
    console.log('[Blueprint] Language:', input.language || 'pt-BR');

    // Chamada com fallback automático Gemini → OpenAI
    const data = await generateBlueprintWithFallback({
        problemText: input.problemText,
        dimensions: input.dimensions,
        answers: input.questionsAnswers,
        complexity: input.complexity,
        language: input.language || 'pt-BR'
    });

    if (!data) throw new Error('Nenhum dado retornado do serviço de IA');

    const provider = getLastUsedProvider();
    console.log(`[Blueprint] Generated successfully using ${provider}`);

    return {
      id: `bp_${Date.now()}_${provider || 'ai'}`,
      ...data,
      // Ensure arrays are at least empty arrays if missing from data
      objectives: data.objectives || [],
      technicalArchitecture: data.technicalArchitecture || [],
      keyFeatures: data.keyFeatures || [],
      successMetrics: data.successMetrics || [],
      risksAndMitigations: data.risksAndMitigations || [],
      nextSteps: data.nextSteps || [],
      createdAt: new Date(),
      generatedBy: provider || undefined
    };
};
