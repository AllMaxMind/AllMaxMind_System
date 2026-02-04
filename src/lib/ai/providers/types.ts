export type AIProvider = 'gemini' | 'openai';

export interface AIProviderConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AnalysisResponse {
  domain: string;
  persona: string;
  intentScore: number;
  emotionalTone: string;
  complexity: 'small' | 'medium' | 'large';
  processedText: string;
  keywords: string[];
}

export interface AdaptiveQuestion {
  id: string;
  text: string;
  category: 'context' | 'process' | 'pain' | 'technical' | 'scale';
  isCritical: boolean;
  explanation: string;
  example: string;
}

export interface QuestionsResponse {
  questions: AdaptiveQuestion[];
}

export interface BlueprintResponse {
  title: string;
  executiveSummary: string;
  problemStatement: string;
  objectives: string[];
  technicalArchitecture: string[];
  keyFeatures: string[];
  timelineEstimate: string;
  projectSize: 'small' | 'medium' | 'large';
  estimatedInvestment: string;
  successMetrics: string[];
  risksAndMitigations: string[];
  nextSteps: string[];
}

export interface AIOperationContext {
  problemText: string;
  dimensions?: any[];
  answers?: any[];
  intentScore?: number;
  complexity?: 'small' | 'medium' | 'large';
  language?: 'en' | 'pt-BR';
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public provider: AIProvider,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}
