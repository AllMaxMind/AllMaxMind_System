
import { DimensionSelection } from '../supabase/dimensions';
import { QuestionAnswer } from '../supabase/answers';
import { generateBlueprint } from '../../services/geminiService';

export interface BlueprintInput {
  problemText: string;
  dimensions: DimensionSelection[];
  questionsAnswers: QuestionAnswer[];
  complexity: 'small' | 'medium' | 'large';
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
}

export const generateTechnicalBlueprint = async (input: BlueprintInput): Promise<Blueprint> => {
    console.log('[Blueprint] Invoking Gemini API (DIRECT)...');
    
    // CHAMADA DIRETA: Sem Fallbacks.
    const data = await generateBlueprint({
        problemText: input.problemText,
        dimensions: input.dimensions,
        answers: input.questionsAnswers,
        complexity: input.complexity
    });

    if (!data) throw new Error('Nenhum dado retornado do serviço de IA');

    return {
      id: `bp_${Date.now()}_real`,
      ...data,
      // Ensure arrays are at least empty arrays if missing from data
      objectives: data.objectives || [],
      technicalArchitecture: data.technicalArchitecture || [],
      keyFeatures: data.keyFeatures || [],
      successMetrics: data.successMetrics || [],
      risksAndMitigations: data.risksAndMitigations || [],
      nextSteps: data.nextSteps || [],
      createdAt: new Date()
    };
};
