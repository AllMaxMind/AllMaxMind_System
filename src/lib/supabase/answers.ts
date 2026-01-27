
import { supabase } from '../supabaseClient';

export interface QuestionAnswer {
  questionId: string;
  question: string;
  answer: string;
  category: string;
  isCritical: boolean;
}

export const saveAnswersToSupabase = async (
  problemId: string,
  answers: QuestionAnswer[],
  complexity: 'small' | 'medium' | 'large'
): Promise<void> => {
  
  console.log('[Supabase] Salvando respostas (NO MOCKS)...');

  // 1. Salvar respostas
  const answerRecords = answers.map(answer => ({
    problem_id: problemId,
    question_type: answer.category,
    question: answer.question,
    answer: answer.answer,
    complexity_score: answer.isCritical ? 2 : 1,
    is_critical: answer.isCritical,
    created_at: new Date().toISOString()
  }));

  const { error: answersError } = await supabase
    .from('questions_answers')
    .insert(answerRecords);

  if (answersError) {
    throw new Error(`DB Error (Answers): ${answersError.message}`);
  }

  // 2. Atualizar problema com complexidade final
  const { error: updateError } = await supabase
    .from('problems')
    .update({
      final_complexity: complexity,
      updated_at: new Date().toISOString(),
      analysis_completed: true
    })
    .eq('id', problemId);

  if (updateError) {
    throw new Error(`DB Error (Update Final): ${updateError.message}`);
  }
};
