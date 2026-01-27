import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Phase1 from '../Phase1';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as problemService from '../../../lib/supabase/problems';
import * as processorService from '../../../lib/ai/processor';
import * as analyticsService from '../../../lib/analytics';

// Mock dependencies
vi.mock('../../ui/Toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock('../../../lib/supabase/problems', () => ({
  saveProblemToSupabase: vi.fn(),
}));

vi.mock('../../../lib/ai/processor', () => ({
  processProblemText: vi.fn(),
}));

vi.mock('../../../lib/analytics', () => ({
  analytics: {
    trackEvent: vi.fn(),
  },
}));

describe('Phase1 Component', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<Phase1 onComplete={mockOnComplete} />);
    expect(screen.getByPlaceholderText(/Exemplo detalhado/i)).toBeInTheDocument();
    expect(screen.getByText(/Descreva sua dor operacional/i)).toBeInTheDocument();
  });

  it('should handle input change and update character count', () => {
    render(<Phase1 onComplete={mockOnComplete} />);
    const textarea = screen.getByPlaceholderText(/Exemplo detalhado/i);
    
    fireEvent.change(textarea, { target: { value: 'This is a test problem description.' } });
    
    expect(textarea).toHaveValue('This is a test problem description.');
    expect(screen.getByText('35/3000')).toBeInTheDocument();
  });

  it('should load example when requested', () => {
    render(<Phase1 onComplete={mockOnComplete} />);
    const exampleBtn = screen.getByText('VER EXEMPLO COMPLETO');
    
    fireEvent.click(exampleBtn);
    
    const textarea = screen.getByPlaceholderText(/Exemplo detalhado/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('Exemplo: Problema de gestão de fretes');
  });

  it('should process and save valid problem', async () => {
    // Setup Mocks
    (processorService.processProblemText as any).mockResolvedValue({
      processedText: 'processed',
      domain: 'logistics',
      persona: 'manager',
      intentScore: 80,
      metadata: {},
      processingTime: 100
    });

    (problemService.saveProblemToSupabase as any).mockResolvedValue('problem_123');

    render(<Phase1 onComplete={mockOnComplete} />);
    
    // Type valid text
    const textarea = screen.getByPlaceholderText(/Exemplo detalhado/i);
    const validText = "Nossa empresa está sofrendo com atrasos na importação e falta de visibilidade nos processos aduaneiros.";
    fireEvent.change(textarea, { target: { value: validText } });

    // Click Analyze
    const analyzeBtn = screen.getByText('ANALISAR MINHA DOR COM IA');
    fireEvent.click(analyzeBtn);

    // Verify loading state
    expect(screen.getByText('Processando...')).toBeInTheDocument();

    // Wait for completion
    await waitFor(() => {
      expect(processorService.processProblemText).toHaveBeenCalledWith(validText);
      expect(problemService.saveProblemToSupabase).toHaveBeenCalled();
      expect(mockOnComplete).toHaveBeenCalledWith('problem_123');
    });
  });

  it('should show error for invalid input', async () => {
    render(<Phase1 onComplete={mockOnComplete} />);
    
    const textarea = screen.getByPlaceholderText(/Exemplo detalhado/i);
    fireEvent.change(textarea, { target: { value: 'Too short' } });

    const analyzeBtn = screen.getByText('ANALISAR MINHA DOR COM IA');
    fireEvent.click(analyzeBtn);

    // Validation happens before async calls
    expect(processorService.processProblemText).not.toHaveBeenCalled();
    // In a real browser test we'd check the Toast, but here we mocked the hook.
    // We implicitly verify success flow didn't happen
    expect(mockOnComplete).not.toHaveBeenCalled();
  });
});