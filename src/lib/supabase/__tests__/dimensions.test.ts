import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveDimensionsToSupabase, DimensionSelection } from '../dimensions';
import { supabase } from '../../supabaseClient';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('saveDimensionsToSupabase', () => {
  const mockUpdate = vi.fn();
  const mockEq = vi.fn();
  const mockInsert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // O fluxo tem duas chamadas para .from()
    // 1. .from('problems').update(...).eq(...)
    // 2. .from('dimensions').insert(...)
    
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'problems') {
        return {
          update: mockUpdate.mockReturnValue({
            eq: mockEq, // Retorna promise no final da cadeia
          }),
        };
      }
      if (table === 'dimensions') {
        return {
          insert: mockInsert,
        };
      }
      return {};
    });
  });

  const selections: DimensionSelection[] = [
    {
      dimensionId: 'freq',
      selectedOptionIds: ['daily'],
      impactScore: 10,
      timestamp: new Date(),
    },
  ];

  it('deve atualizar o score do problema e inserir dimensões com sucesso', async () => {
    // Mock Sucesso Update
    mockEq.mockResolvedValue({ error: null });
    // Mock Sucesso Insert
    mockInsert.mockResolvedValue({ error: null });

    await expect(saveDimensionsToSupabase('prob_123', selections, 90)).resolves.not.toThrow();

    // Verifica update do problema
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      intent_score: 90
    }));
    expect(mockEq).toHaveBeenCalledWith('id', 'prob_123');

    // Verifica insert das dimensões
    expect(mockInsert).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        problem_id: 'prob_123',
        dimension_id: 'freq',
        impact_score: 10
      })
    ]));
  });

  it('deve falhar se a atualização do problema falhar', async () => {
    mockEq.mockResolvedValue({ error: { message: 'Problem not found' } });

    await expect(saveDimensionsToSupabase('prob_123', selections, 90))
      .rejects.toThrow('DB Error (Update): Problem not found');

    // Não deve tentar inserir dimensões se o problema falhou
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('deve falhar se a inserção de dimensões falhar', async () => {
    mockEq.mockResolvedValue({ error: null }); // Update ok
    mockInsert.mockResolvedValue({ error: { message: 'Insert failed' } }); // Insert fail

    await expect(saveDimensionsToSupabase('prob_123', selections, 90))
      .rejects.toThrow('DB Error (Dimensions): Insert failed');
  });
});