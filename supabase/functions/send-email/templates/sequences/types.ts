// Email Context Types for Sequences
// Story 5.4

export interface EmailContext {
  leadId: string;
  leadName: string;
  leadEmail: string;
  companyName: string;
  blueprintTitle: string;
  problemStatement: string;
  leadScore: number;
  leadStatus: 'quente' | 'acompanhando' | 'morno';
  caseStudyUrl?: string;
  scheduleUrl?: string;
  unsubscribeUrl?: string;
}

export type SequenceTemplateId =
  | 'quente_1' | 'quente_2' | 'quente_3' | 'quente_4'
  | 'acomp_1' | 'acomp_2' | 'acomp_3' | 'acomp_4'
  | 'morno_1' | 'morno_2' | 'morno_3' | 'morno_4';
