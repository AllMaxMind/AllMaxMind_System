import { AppStage } from './types';

export const APP_NAME = "ALL MAX MIND";
export const APP_TAGLINE = "Architect Your Intelligence";

export const STAGE_CONFIG: Record<AppStage, { title: string; step: number }> = {
  [AppStage.LANDING]: { title: 'Welcome', step: 0 },
  [AppStage.PASSIVE_DATA]: { title: 'Initializing', step: 1 },
  [AppStage.PROBLEM_INTAKE]: { title: 'Define Problem', step: 2 },
  [AppStage.DIMENSION_SELECTION]: { title: 'Select Dimensions', step: 3 },
  [AppStage.ADAPTIVE_QUESTIONS]: { title: 'Deep Dive', step: 4 },
  [AppStage.BLUEPRINT_PREVIEW]: { title: 'Your Blueprint', step: 5 },
};

// Placeholder for future API configurations
export const MODEL_CONFIG_TEXT = "gemini-3-flash-preview";
export const MODEL_CONFIG_REASONING = "gemini-3-pro-preview";
