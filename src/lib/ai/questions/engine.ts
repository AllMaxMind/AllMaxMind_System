
import { DimensionSelection } from '../../supabase/dimensions';
import { QuestionAnswer } from '../../supabase/answers';
import { generateAdaptiveQuestionsWithFallback } from '../providers/api';

interface GenerateQuestionsInput {
  problemText: string;
  dimensions: DimensionSelection[];
  intentScore: number;
  previousAnswers: QuestionAnswer[];
  language?: 'pt-BR' | 'en';
}

export interface AdaptiveQuestion {
  id: string;
  text: string;
  category: 'context' | 'process' | 'pain' | 'technical' | 'scale';
  isCritical: boolean;
  explanation?: string;
  example?: string;
}

export class AdaptiveQuestionEngine {

  async generate(input: GenerateQuestionsInput): Promise<AdaptiveQuestion[]> {
    console.log('[QuestionEngine] Requesting adaptive questions with fallback...');
    console.log('[QuestionEngine] Language:', input.language || 'pt-BR');

    // Usar API com fallback automático Gemini → OpenAI
    const data = await generateAdaptiveQuestionsWithFallback({
      problemText: input.problemText,
      dimensions: input.dimensions,
      intentScore: input.intentScore,
      answers: input.previousAnswers,
      language: input.language || 'pt-BR',
      complexity: 'medium'  // Will be refined later
    });

    if (data && Array.isArray(data.questions)) {
      return data.questions.map((q: any, i: number) => ({
          ...q,
          id: q.id || `q_${Date.now()}_${i}`
      }));
    }
    
    throw new Error('Formato inválido recebido da IA.');
  }
}

export const adaptiveQuestionEngine = new AdaptiveQuestionEngine();
