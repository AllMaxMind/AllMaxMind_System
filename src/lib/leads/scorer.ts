export type LeadStatus = 'morno' | 'acompanhando' | 'quente';

export interface LeadScoringInput {
  // Phase 4 heuristics
  emailDomain?: string;
  jobTitle?: string;
  companySize?: number;

  // Phase 5 inputs
  feedbackScore?: number;
  budgetRange?: string;
  timeline?: number;
  callScheduled?: boolean;
  whatsappAdded?: boolean;
}

// Budget range points mapping
const BUDGET_POINTS: Record<string, number> = {
  'ate_30k': 10,
  '30_60k': 20,
  '60_120k': 30,
  'acima_120k': 40,
};

// Timeline points mapping (based on days)
const getTimelinePoints = (days: number): number => {
  if (days <= 14) return 30;  // Urgente
  if (days <= 30) return 20;   // Próximo mês
  if (days <= 90) return 10;   // 3 meses
  return 5;                     // Futuro
};

/**
 * Calculate initial lead score (Phase 4 - heuristic)
 */
export function calculateInitialScore(input: Pick<LeadScoringInput, 'emailDomain' | 'jobTitle' | 'companySize'>): number {
  let score = 50; // Base

  if (input.emailDomain) {
    const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com'];
    const isCorporateEmail = !freeProviders.includes(input.emailDomain.toLowerCase());
    if (isCorporateEmail) score += 10;
  }

  if (input.jobTitle) {
    const seniorTitles = ['ceo', 'cto', 'cfo', 'coo', 'director', 'diretor', 'gerente', 'manager', 'vp', 'vice', 'head', 'founder', 'fundador'];
    const isSenior = seniorTitles.some(title => input.jobTitle!.toLowerCase().includes(title));
    if (isSenior) score += 15;
  }

  if (input.companySize && input.companySize > 50) {
    score += 10;
  }

  return Math.min(score, 85); // Cap at 85 before Phase 5
}

/**
 * Calculate dynamic lead score (Phase 5)
 */
export function calculateDynamicScore(input: LeadScoringInput): { score: number; status: LeadStatus } {
  let score = 0;

  // Phase 5 inputs replace initial score
  if (input.feedbackScore) {
    score = input.feedbackScore; // Base from feedback (20-100)
  } else {
    score = 50; // Default if no feedback
  }

  if (input.budgetRange) {
    score += BUDGET_POINTS[input.budgetRange] || 0;
  }

  if (input.timeline && input.timeline > 0) {
    score += getTimelinePoints(input.timeline);
  }

  if (input.callScheduled) {
    score += 30;
  }

  if (input.whatsappAdded) {
    score += 10;
  }

  // Normalize to 50-100 range
  // Max possible raw score: 100 + 40 + 30 + 30 + 10 = 210
  // Normalize: score = 50 + (raw / 210 * 50)
  const normalizedScore = Math.round(50 + (Math.min(score, 210) / 210) * 50);
  const finalScore = Math.max(50, Math.min(normalizedScore, 100));

  // Determine status
  const status = getLeadStatus(finalScore);

  return { score: finalScore, status };
}

/**
 * Get lead status based on score
 */
export function getLeadStatus(score: number): LeadStatus {
  if (score >= 75) return 'quente';
  if (score >= 60) return 'acompanhando';
  return 'morno';
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: LeadStatus): string {
  switch (status) {
    case 'quente':
      return 'text-green-500';
    case 'acompanhando':
      return 'text-yellow-500';
    case 'morno':
    default:
      return 'text-gray-500';
  }
}

/**
 * Get status emoji for UI
 */
export function getStatusEmoji(status: LeadStatus): string {
  switch (status) {
    case 'quente':
      return '🔥';
    case 'acompanhando':
      return '👀';
    case 'morno':
    default:
      return '❄️';
  }
}
