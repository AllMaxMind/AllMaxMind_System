// Problem validation utilities

export interface ProblemValidation {
  valid: boolean;
  errors: string[];
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

// Track rate limits per visitor
const rateLimitStore = new Map<string, number>();
const RATE_LIMIT_WINDOW = 10000; // 10 seconds

export function validateProblemInput(problemText: string, domain: string): ProblemValidation {
  const errors: string[] = [];

  if (!problemText || problemText.trim().length === 0) {
    errors.push('Problem description is required');
  }

  if (problemText.trim().length < 10) {
    errors.push('Problem description must be at least 10 characters');
  }

  if (problemText.trim().length > 5000) {
    errors.push('Problem description must not exceed 5000 characters');
  }

  const validDomains = ['technical', 'business', 'strategic'];
  if (!validDomains.includes(domain)) {
    errors.push('Invalid domain selected');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateProblemText(problemText: string): ProblemValidation {
  const errors: string[] = [];
  const trimmed = problemText.trim();
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);

  if (trimmed.length < 20) {
    errors.push('Descrição muito curta. Descreva seu problema com mais detalhes.');
  }

  if (words.length < 5) {
    errors.push('Seu texto precisa de pelo menos 5 palavras.');
  }

  // Detect repetitive spam
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const repetitionRatio = uniqueWords.size / words.length;
  if (repetitionRatio < 0.3) {
    errors.push('Texto parece repetitivo ou inválido. Descreva seu problema real.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function checkRateLimit(visitorId: string): RateLimitResult {
  const now = Date.now();
  const lastSubmission = rateLimitStore.get(visitorId);

  if (!lastSubmission) {
    // First submission allowed
    rateLimitStore.set(visitorId, now);
    return { allowed: true };
  }

  const timeSinceLastSubmission = now - lastSubmission;

  if (timeSinceLastSubmission < RATE_LIMIT_WINDOW) {
    // Still in cooldown
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW - timeSinceLastSubmission) / 1000);
    return { allowed: false, retryAfter };
  }

  // Cooldown expired, allow new submission
  rateLimitStore.set(visitorId, now);
  return { allowed: true };
}
