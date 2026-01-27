export const validateProblemText = (text: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (text.length < 20) {
    errors.push('Descrição muito curta. Descreva com mais detalhes (mínimo 20 caracteres).');
  }
  
  if (text.length > 3000) {
    errors.push('Descrição muito longa. Limite de 3000 caracteres.');
  }
  
  if (text.trim().split(/\s+/).length < 5) {
    errors.push('Use pelo menos 5 palavras para uma análise precisa.');
  }
  
  // Verificar se é apenas spam ou caracteres aleatórios
  const uniqueChars = new Set(text.toLowerCase().replace(/\s+/g, ''));
  if (uniqueChars.size < 5) {
    errors.push('Texto parece repetitivo ou inválido. Descreva seu problema real.');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Rate limiting para submissions
const submissionLimiter = new Map<string, number>();

export const checkRateLimit = (visitorId: string): { allowed: boolean; retryAfter: number } => {
  const now = Date.now();
  const lastSubmission = submissionLimiter.get(visitorId) || 0;
  const timeSinceLast = now - lastSubmission;
  
  // Limite: 1 submission a cada 10 segundos para UX fluida, mas protegida
  const LIMIT_MS = 10000;

  if (timeSinceLast < LIMIT_MS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((LIMIT_MS - timeSinceLast) / 1000)
    };
  }
  
  submissionLimiter.set(visitorId, now);
  return { allowed: true, retryAfter: 0 };
};