// ALL MAX MIND - Application Constants

export const APP_NAME = 'ALL MAX MIND';
export const APP_VERSION = '1.0.0';
export const APP_TAGLINE = 'Architect Your Intelligence';

// Gemini Models
export const GEMINI_MODELS = {
  FLASH: 'gemini-2.5-flash',
  PRO: 'gemini-3-pro',
} as const;

// Model Configuration
export const MODEL_CONFIG_TEXT = {
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  maxTokens: 2048,
} as const;

export const MODEL_CONFIG_REASONING = {
  model: 'gemini-3-pro',
  temperature: 0.3,
  maxTokens: 4096,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  PROBLEMS: '/api/problems',
  DIMENSIONS: '/api/dimensions',
  QUESTIONS: '/api/questions',
  ANSWERS: '/api/answers',
  BLUEPRINT: '/api/blueprint',
  LEADS: '/api/leads',
} as const;

// Phases
export const PHASES = {
  LANDING: 'LANDING',
  PASSIVE_DATA: 'PASSIVE_DATA',
  PROBLEM_INTAKE: 'PROBLEM_INTAKE',
  DIMENSION_SELECTION: 'DIMENSION_SELECTION',
  ADAPTIVE_QUESTIONS: 'ADAPTIVE_QUESTIONS',
  BLUEPRINT_PREVIEW: 'BLUEPRINT_PREVIEW',
  LEAD_CAPTURED: 'LEAD_CAPTURED',
} as const;

// Domains
export const DOMAINS = ['technical', 'business', 'strategic'] as const;

// Personas
export const PERSONAS = ['developer', 'manager', 'executive', 'other'] as const;
