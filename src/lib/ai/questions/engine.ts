
import { DimensionSelection } from '../../supabase/dimensions';
import { QuestionAnswer } from '../../supabase/answers';
import { generateAdaptiveQuestions } from '../../../services/geminiService';

interface GenerateQuestionsInput {
  problemText: string;
  dimensions: DimensionSelection[];
  intentScore: number;
  previousAnswers: QuestionAnswer[];
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
    console.log('[QuestionEngine] Requesting adaptive questions (DIRECT)...');

    // CHAMADA DIRETA: Sem fallback. Se falhar, o usuário verá o erro.
    const data = await generateAdaptiveQuestions({
      problemText: input.problemText,
      dimensions: input.dimensions,
      intentScore: input.intentScore,
      previousAnswers: input.previousAnswers
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
