import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { saveLeadToSupabase, validateLeadForm } from '../manager';
import { supabase } from '../../supabaseClient';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('Leads Manager', () => {
  
  describe('validateLeadForm', () => {
    it('deve validar um formulário correto', () => {
      const form = {
        name: 'John Doe',
        email: 'john@corp.com',
        company: 'Corp Inc',
        phone: '11999999999',
        acceptTerms: true
      };
      const result = validateLeadForm(form);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('deve rejeitar email inválido', () => {
      const form = {
        name: 'John',
        email: 'invalid-email',
        company: 'Corp',
        phone: '123456789',
        acceptTerms: true
      };
      const result = validateLeadForm(form);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Email inválido');
    });

    it('deve exigir aceite dos termos', () => {
      const form = {
        name: 'John',
        email: 'john@corp.com',
        company: 'Corp',
        phone: '123456789',
        acceptTerms: false
      };
      const result = validateLeadForm(form);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Você precisa aceitar os termos e condições');
    });
  });

  describe('saveLeadToSupabase', () => {
    const mockInsert = vi.fn();
    const mockSelect = vi.fn();
    const mockSingle = vi.fn();

    const leadData = {
      problemId: 'prob_123',
      name: 'John',
      email: 'john@test.com',
      company: 'Test Co',
      phone: '1199999999',
      contactPreference: 'email' as const,
      acceptTerms: true,
      acceptMarketing: false,
      complexity: 'small' as const
    };

    beforeEach(() => {
      vi.clearAllMocks();
      
      // Setup LocalStorage Mock
      const localStorageMock = (function() {
        let store: Record<string, string> = {};
        return {
          getItem: vi.fn((key: string) => store[key] || null),
          setItem: vi.fn((key: string, value: string) => { store[key] = value.toString(); }),
          clear: () => { store = {}; }
        };
      })();
      vi.stubGlobal('localStorage', localStorageMock);

      // Setup Supabase Mock
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

    it('deve salvar lead com sucesso se não houver rate limit', async () => {
      mockSingle.mockResolvedValue({ data: { id: 'lead_1' }, error: null });

      const id = await saveLeadToSupabase(leadData);

      expect(id).toBe('lead_1');
      expect(mockInsert).toHaveBeenCalled();
      // Verifica se o timestamp foi salvo para rate limit
      expect(localStorage.setItem).toHaveBeenCalledWith(
        `lead_submission_${leadData.email}`, 
        expect.any(String)
      );
    });

    it('deve bloquear envio se feito muito recentemente (Rate Limit)', async () => {
      // Simula envio recente (agora - 1 segundo)
      const recentTime = Date.now() - 1000;
      vi.spyOn(localStorage, 'getItem').mockReturnValue(recentTime.toString());

      await expect(saveLeadToSupabase(leadData))
        .rejects.toThrow('Aguarde um momento antes de enviar novamente.');

      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('deve permitir envio após expiração do rate limit', async () => {
      // Simula envio antigo (agora - 31 segundos)
      const oldTime = Date.now() - 31000;
      vi.spyOn(localStorage, 'getItem').mockReturnValue(oldTime.toString());
      
      mockSingle.mockResolvedValue({ data: { id: 'lead_2' }, error: null });

      await expect(saveLeadToSupabase(leadData)).resolves.toBe('lead_2');
    });

    it('deve lançar erro se Supabase falhar', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Duplicate email' } });

      await expect(saveLeadToSupabase(leadData))
        .rejects.toThrow('DB Error (Leads): Duplicate email');
    });
  });
});