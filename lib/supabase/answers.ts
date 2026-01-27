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
  try {
    // Salvar respostas
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

    if (answersError) throw answersError;

    // Atualizar problema com complexidade final
    const { error: updateError } = await supabase
      .from('problems')
      .update({
        final_complexity: complexity,
        updated_at: new Date().toISOString(),
        analysis_completed: true
      })
      .eq('id', problemId);

    if (updateError) throw updateError;

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[Phase3] Answers saved successfully:', {
        problemId,
        answerCount: answers.length,
        complexity
      });
    }

  } catch (error) {
    console.error('[Phase3] Error saving answers:', error);
    
    // Fallback local
    try {
      localStorage.setItem(`answers_${problemId}`, JSON.stringify({
        answers,
        complexity,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      console.error('Local storage error', e);
    }
    
    // Non-blocking error for UX continuity in prototype
  }
};
