import { supabase } from '../supabaseClient';
import { DimensionSelection } from '../supabase/dimensions';
import { QuestionAnswer } from '../supabase/answers';

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
  try {
    console.log('[Blueprint] Invoking secure Edge Function...');
    
    // CHAMADA SEGURA AO BACKEND (Supabase Edge Function)
    // A lógica de prompt e a API Key do Gemini ficam escondidas no servidor
    const { data, error } = await supabase.functions.invoke('generate-blueprint', {
      body: {
        problemText: input.problemText,
        dimensions: input.dimensions,
        answers: input.questionsAnswers,
        complexity: input.complexity
      }
    });

    if (error) throw error;
    if (!data) throw new Error('No data returned from AI service');

    return {
      id: `bp_${Date.now()}_secure`,
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
    
  } catch (error) {
    console.error('[Blueprint] Server generation failed, falling back to offline mode:', error);
    
    // Fallback gracioso para offline ou erro de API
    return generateFallbackBlueprint(input);
  }
};

const generateFallbackBlueprint = (input: BlueprintInput): Blueprint => {
  // Fallback estático mantido para resiliência
  const timelineMap = {
    small: '2-3 semanas',
    medium: '4-6 semanas',
    large: '8-12 semanas'
  };
  
  const investmentMap = {
    small: 'R$ 15.000 - R$ 30.000',
    medium: 'R$ 30.000 - R$ 60.000',
    large: 'R$ 60.000 - R$ 120.000+'
  };
  
  return {
    id: `fb_bp_${Date.now()}`,
    title: `Solução Estruturada: ${input.complexity.toUpperCase()}`,
    executiveSummary: `Blueprint gerado em modo de contingência. A análise detalhada indica uma necessidade de intervenção na área de ${input.dimensions[0]?.dimensionId || 'processos'}.`,
    problemStatement: input.problemText,
    objectives: ['Otimização de Processos', 'Redução de Custos', 'Automação'],
    technicalArchitecture: ['Cloud Native', 'API First', 'Supabase', 'React'],
    keyFeatures: ['Painel de Controle', 'Automação de Fluxo', 'Relatórios'],
    timelineEstimate: timelineMap[input.complexity],
    projectSize: input.complexity,
    estimatedInvestment: investmentMap[input.complexity],
    successMetrics: ['ROI > 150%', 'Redução de tempo em 60%'],
    risksAndMitigations: ['Risco: Adoção -> Mitigação: Treinamento'],
    nextSteps: ['Agendar Validação Técnica'],
    createdAt: new Date()
  };
};