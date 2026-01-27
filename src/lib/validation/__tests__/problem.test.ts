import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateProblemText, checkRateLimit } from '../problem';

describe('Problem Validation', () => {
  it('should fail if text is too short', () => {
    const result = validateProblemText("Curto");
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('muito curta');
  });

  it('should fail if text has few words', () => {
    const result = validateProblemText("Uma frase com poucas palavras"); // 5 words is min
    // "Uma frase com poucas palavras" -> 5 words. Let's try 4.
    const result2 = validateProblemText("Uma frase curta");
    expect(result2.valid).toBe(false);
  });

  it('should pass for valid description', () => {
    const text = "Temos um problema sério de gestão de estoque que afeta nossas vendas diárias e causa prejuízo.";
    const result = validateProblemText(text);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect repetitive spam', () => {
    const text = "teste teste teste teste teste teste teste teste";
    const result = validateProblemText(text);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Texto parece repetitivo ou inválido. Descreva seu problema real.');
  });
});

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should block rapid submissions', () => {
    const visitorId = 'user_1';
    
    // First check - allowed
    const first = checkRateLimit(visitorId);
    expect(first.allowed).toBe(true);

    // Immediate second check - blocked
    const second = checkRateLimit(visitorId);
    expect(second.allowed).toBe(false);
    expect(second.retryAfter).toBeGreaterThan(0);
  });

  it('should allow submission after time limit', () => {
    const visitorId = 'user_2';
    
    checkRateLimit(visitorId); // consume token
    
    // Advance time by 11 seconds (limit is 10s)
    vi.advanceTimersByTime(11000);
    
    const second = checkRateLimit(visitorId);
    expect(second.allowed).toBe(true);
  });
});