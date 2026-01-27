import { supabase } from '../supabaseClient';

export interface DimensionSelection {
  dimensionId: string;
  selectedOptionIds: string[];
  impactScore: number;
  timestamp: Date;
}

export const saveDimensionsToSupabase = async (
  problemId: string,
  selections: DimensionSelection[],
  refinedIntentScore: number
): Promise<void> => {
  try {
    // 1. Atualizar score do problema
    const { error: updateError } = await supabase
      .from('problems')
      .update({ 
        intent_score: refinedIntentScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', problemId);

    if (updateError) throw updateError;

    // 2. Salvar dimensões
    const dimensionRecords = selections.flatMap(selection =>
      selection.selectedOptionIds.map(optionId => ({
        problem_id: problemId,
        dimension_id: selection.dimensionId,
        option_id: optionId,
        impact_score: selection.impactScore,
        created_at: new Date().toISOString()
      }))
    );

    const { error: dimensionsError } = await supabase
      .from('dimensions')
      .insert(dimensionRecords);

    if (dimensionsError) throw dimensionsError;

    // Log de analytics (dev)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[Phase2] Dimensions saved successfully:', {
        problemId,
        dimensionCount: selections.length,
        refinedIntentScore
      });
    }

  } catch (error) {
    console.error('[Phase2] Error saving dimensions:', error);
    
    // Fallback local: Salvar no localStorage caso Supabase falhe
    try {
      const fallbackData = {
        problemId,
        selections,
        refinedIntentScore,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`dimensions_${problemId}`, JSON.stringify(fallbackData));
      
      // Update local problem score if it exists
      const localProblemJson = localStorage.getItem(`problem_${problemId}`);
      if (localProblemJson) {
        const localProblem = JSON.parse(localProblemJson);
        localProblem.intent_score = refinedIntentScore;
        localProblem.updated_at = new Date().toISOString();
        localStorage.setItem(`problem_${problemId}`, JSON.stringify(localProblem));
      }
    } catch (e) {
      console.error('Local storage error', e);
    }
    
    // Re-throw is optional depending on if we want to block UI, 
    // but usually we want to proceed if fallback works. 
    // For this implementation, we log and swallow to allow UX continuity.
  }
};