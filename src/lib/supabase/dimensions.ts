
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
  
  console.log('[Supabase] Salvando dimensões (NO MOCKS)...');

  // 1. Atualizar score do problema
  const { error: updateError } = await supabase
    .from('problems')
    .update({ 
      intent_score: refinedIntentScore,
      updated_at: new Date().toISOString()
    })
    .eq('id', problemId);

  if (updateError) {
    throw new Error(`DB Error (Update): ${updateError.message}`);
  }

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

  if (dimensionsError) {
    throw new Error(`DB Error (Dimensions): ${dimensionsError.message}`);
  }
};
