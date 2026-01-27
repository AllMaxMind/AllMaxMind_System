import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveAnswersToSupabase, QuestionAnswer } from '../answers';
import { supabase } from '../../supabaseClient';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('saveAnswersToSupabase', () => {
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockEq = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'questions_answers') {
        return { insert: mockInsert };
      }
      if (table === 'problems') {
        return {
          update: mockUpdate.mockReturnValue({
            eq: mockEq,
          }),
        };
      }
      return {};
    });
  });

  const answers: QuestionAnswer[] = [
    {
      questionId: 'q1',
      question: 'Why?',
      answer: 'Because.',
      category: 'context',
      isCritical: true,
    }
  ];

  it('deve salvar respostas e finalizar o problema', async () => {
    mockInsert.mockResolvedValue({ error: null });
    mockEq.mockResolvedValue({ error: null });

    await expect(saveAnswersToSupabase('prob_123', answers, 'medium')).resolves.not.toThrow();

    expect(mockInsert).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        problem_id: 'prob_123',
        question: 'Why?',
        complexity_score: 2, // Critical = 2
      })
    ]));

    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      final_complexity: 'medium',
      analysis_completed: true
    }));
  });

  it('deve falhar se salvar respostas der erro', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'DB Error' } });

    await expect(saveAnswersToSupabase('prob_123', answers, 'medium'))
      .rejects.toThrow('Erro ao salvar respostas: DB Error');
      
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('deve falhar se atualizar status do problema der erro', async () => {
    mockInsert.mockResolvedValue({ error: null });
    mockEq.mockResolvedValue({ error: { message: 'Update Error' } });

    await expect(saveAnswersToSupabase('prob_123', answers, 'medium'))
      .rejects.toThrow('Erro ao atualizar problema: Update Error');
  });
});