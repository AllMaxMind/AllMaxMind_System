// Enums for Application Stages (Mapping to the Implementation Plan)
export enum AppStage {
  LANDING = 'LANDING',           // ETAPA 2: Landing Page WAUUUU
  PASSIVE_DATA = 'PASSIVE_DATA', // ETAPA 3: Analytics Setup (Background)
  PROBLEM_INTAKE = 'PROBLEM_INTAKE', // ETAPA 4: Core Input
  DIMENSION_SELECTION = 'DIMENSION_SELECTION', // ETAPA 5
  ADAPTIVE_QUESTIONS = 'ADAPTIVE_QUESTIONS', // ETAPA 6
  BLUEPRINT_PREVIEW = 'BLUEPRINT_PREVIEW', // ETAPA 7
}

export interface UserSession {
  sessionId: string;
  startedAt: Date;
  stage: AppStage;
}

export interface BlueprintDraft {
  problemStatement: string;
  dimensions: string[];
  complexityScore: number;
}

// UI Types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow';
export type ButtonSize = 'sm' | 'md' | 'lg';
