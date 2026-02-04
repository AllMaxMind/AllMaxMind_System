// Enums for Application Stages (Mapping to the Implementation Plan)
export enum AppStage {
  LANDING = 'LANDING',           // Landing Page with Problem Intake
  PASSIVE_DATA = 'PASSIVE_DATA', // Analytics Setup (Background)
  DIMENSION_SELECTION = 'DIMENSION_SELECTION', // Phase 2: Dimension Selection
  ADAPTIVE_QUESTIONS = 'ADAPTIVE_QUESTIONS', // Phase 3: Adaptive Questions
  BLUEPRINT_PREVIEW = 'BLUEPRINT_PREVIEW', // Phase 4: Blueprint Preview
  ADMIN = 'ADMIN',               // Admin Dashboard (Story P4)
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
