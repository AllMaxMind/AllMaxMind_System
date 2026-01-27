import { supabase } from '../../supabaseClient';
import { DimensionSelection } from '../../supabase/dimensions';
import { QuestionAnswer } from '../../supabase/answers';

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
    try {
      console.log('[QuestionEngine] Requesting adaptive questions from Cloud Brain...');

      // Chamada à Edge Function 'generate-questions'
      // Isso protege nosso "molho secreto" de engenharia de prompt
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: {
          problemText: input.problemText,
          dimensions: input.dimensions,
          intentScore: input.intentScore,
          previousAnswers: input.previousAnswers
        }
      });

      if (error) throw error;
      
      // Validação básica do retorno
      if (data && Array.isArray(data.questions)) {
        return data.questions.map((q: any, i: number) => ({
           ...q,
           id: q.id || `q_${Date.now()}_${i}`
        }));
      }
      
      throw new Error('Invalid response format from AI');

    } catch (error) {
      console.warn('[QuestionEngine] Cloud generation failed, using local heuristics.', error);
      return this.getFallbackQuestions(3);
    }
  }

  private getFallbackQuestions(count: number): AdaptiveQuestion[] {
    // Perguntas de "Segurança" caso a API falhe
    const questions: AdaptiveQuestion[] = [
      {
        id: 'fb_1',
        text: 'Onde exatamente ocorre o problema no seu fluxo operacional atual?',
        category: 'context',
        isCritical: true,
        explanation: 'Modo Offline: Identificação de contexto.',
        example: 'Descreva o departamento ou etapa.'
      },
      {
        id: 'fb_2',
        text: 'Qual o impacto financeiro estimado deste problema mensalmente?',
        category: 'scale',
        isCritical: true,
        explanation: 'Modo Offline: Quantificação de dor.',
        example: 'Valor em R$ ou horas perdidas.'
      },
      {
        id: 'fb_3',
        text: 'Quais ferramentas vocês usam hoje para tentar resolver isso?',
        category: 'technical',
        isCritical: false,
        explanation: 'Modo Offline: Análise técnica.',
        example: 'Excel, ERP, Email...'
      }
    ];

    return questions.slice(0, count);
  }
}

export const adaptiveQuestionEngine = new AdaptiveQuestionEngine();