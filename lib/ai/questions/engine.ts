import { supabase } from '../../supabaseClient';
import { DimensionSelection } from '../../supabase/dimensions';
import { QuestionAnswer } from '../../supabase/answers';

interface GenerateQuestionsInput {
  problemText: string;
  dimensions: DimensionSelection[];
  intentScore: number;
  previousAnswers: QuestionAnswer[];
  language?: string;
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
      console.log('[QuestionEngine] Language being sent:', input.language || 'pt-BR');
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: {
          problemText: input.problemText,
          dimensions: input.dimensions,
          intentScore: input.intentScore,
          previousAnswers: input.previousAnswers,
          language: input.language || 'pt-BR'
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
      const isPortuguese = input.language && input.language.startsWith('pt');
      return this.getFallbackQuestions(3, isPortuguese);
    }
  }

  private getFallbackQuestions(count: number, isPortuguese: boolean = false): AdaptiveQuestion[] {
    // Perguntas de "Segurança" caso a API falhe
    const questions: AdaptiveQuestion[] = isPortuguese
      ? [
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
        ]
      : [
          {
            id: 'fb_1',
            text: 'Where exactly does this problem occur in your current operational flow?',
            category: 'context',
            isCritical: true,
            explanation: 'Offline Mode: Context identification.',
            example: 'Describe the department or stage.'
          },
          {
            id: 'fb_2',
            text: 'What is the estimated financial impact of this problem monthly?',
            category: 'scale',
            isCritical: true,
            explanation: 'Offline Mode: Pain quantification.',
            example: 'Amount in $ or lost hours.'
          },
          {
            id: 'fb_3',
            text: 'What tools are you currently using to try to solve this?',
            category: 'technical',
            isCritical: false,
            explanation: 'Offline Mode: Technical analysis.',
            example: 'Excel, ERP, Email...'
          }
        ];

    return questions.slice(0, count);
  }
}

export const adaptiveQuestionEngine = new AdaptiveQuestionEngine();