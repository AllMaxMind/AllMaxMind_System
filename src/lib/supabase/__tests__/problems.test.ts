import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { saveProblemToSupabase, ProblemData } from '../problems';
import { supabase } from '../../supabaseClient';

// Mock do Supabase Client
vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('saveProblemToSupabase', () => {
  const mockInsert = vi.fn();
  const mockSelect = vi.fn();
  const mockSingle = vi.fn();

  // Configuração da cadeia de chamadas do Supabase
  // .from('problems').insert([...]).select('id').single()
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock do LocalStorage/SessionStorage
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => 'visitor_123') });
    vi.stubGlobal('sessionStorage', { getItem: vi.fn(() => 'session_456') });

    // Encadeamento do Mock
    (supabase.from as any).mockReturnValue({
      insert: mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle,
        }),
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const validProblem: ProblemData = {
    raw_text: 'Problema de teste',
    processed_text: 'problema teste',
    domain: 'logistics',
    persona: 'manager',
    intent_score: 80,
    metadata: { keywords: ['teste'] },
  };

  it('deve salvar um problema com sucesso e retornar o ID', async () => {
    // Setup Sucesso
    mockSingle.mockResolvedValue({
      data: { id: 'prob_123' },
      error: null,
    });

    const result = await saveProblemToSupabase(validProblem);

    expect(result).toBe('prob_123');
    expect(supabase.from).toHaveBeenCalledWith('problems');
    expect(mockInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        visitor_id: 'visitor_123',
        raw_text: 'Problema de teste',
        intent_score: 80,
      }),
    ]);
  });

  it('deve lançar erro se o Supabase retornar erro', async () => {
    // Setup Erro
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Erro de conexão' },
    });

    await expect(saveProblemToSupabase(validProblem)).rejects.toThrow('Erro de banco de dados: Erro de conexão');
  });

  it('deve lançar erro se nenhum dado for retornado', async () => {
    // Setup Retorno Vazio
    mockSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    await expect(saveProblemToSupabase(validProblem)).rejects.toThrow('Erro desconhecido');
  });
});