// Email Sequence Types for Story 5.4

export type LeadStatus = 'quente' | 'acompanhando' | 'morno';

export interface EmailContext {
  leadId: string;
  leadName: string;
  leadEmail: string;
  companyName: string;
  blueprintTitle: string;
  problemStatement: string;
  leadScore: number;
  leadStatus: LeadStatus;
  caseStudyUrl?: string;
  scheduleUrl?: string;
  unsubscribeUrl?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  delayMinutes: number;
}

export interface EmailSequence {
  id: string;
  lead_id: string;
  lead_status: LeadStatus;
  current_email_number: number;
  next_send_at: string;
  is_completed: boolean;
  is_paused: boolean;
  unsubscribed: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailQueueItem {
  id: string;
  lead_id: string;
  sequence_id: string;
  template_id: string;
  template_name: string;
  scheduled_at: string;
  context: EmailContext;
  sent: boolean;
  sent_at?: string;
  error_message?: string;
  retry_count: number;
}

export const EMAIL_SEQUENCES_CONFIG: Record<LeadStatus, EmailTemplate[]> = {
  quente: [
    { id: 'quente_1', name: 'Thank You + Next Steps', subject: 'Seu Blueprint Tecnico esta pronto!', delayMinutes: 5 },
    { id: 'quente_2', name: 'Case Study', subject: 'Como empresas similares reduziram custos', delayMinutes: 24 * 60 },
    { id: 'quente_3', name: 'Technical Analysis', subject: 'Sua analise tecnica detalhada', delayMinutes: 48 * 60 },
    { id: 'quente_4', name: 'Schedule Call', subject: 'Confirmar discussao com especialista', delayMinutes: 72 * 60 },
  ],
  acompanhando: [
    { id: 'acomp_1', name: 'Interesting Situation', subject: 'Achamos sua situacao muito interessante', delayMinutes: 5 },
    { id: 'acomp_2', name: 'Similar Case', subject: 'Case: Empresa similar implementou em 30 dias', delayMinutes: 3 * 24 * 60 },
    { id: 'acomp_3', name: 'Cost Reduction Guide', subject: 'Reduzir custos operacionais: Guia pratico', delayMinutes: 7 * 24 * 60 },
    { id: 'acomp_4', name: 'Discount Offer', subject: 'Aproveite 20% de desconto por tempo limitado', delayMinutes: 14 * 24 * 60 },
  ],
  morno: [
    { id: 'morno_1', name: 'We Wait', subject: 'Vamos conversar quando quiser', delayMinutes: 5 },
    { id: 'morno_2', name: 'Blueprint Saved', subject: 'Seu blueprint esta salvo em nossa plataforma', delayMinutes: 7 * 24 * 60 },
    { id: 'morno_3', name: 'AI News', subject: 'Novidades: IA ja esta transformando empresas', delayMinutes: 14 * 24 * 60 },
    { id: 'morno_4', name: 'Special Offer', subject: 'Oferta especial: Consultoria gratuita de 1h', delayMinutes: 30 * 24 * 60 },
  ],
};
