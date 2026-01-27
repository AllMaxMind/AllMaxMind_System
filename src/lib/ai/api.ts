import { supabase } from '../supabaseClient';

export const isAIConfigured = (): boolean => {
  // Verify if we have a supabase client instance
  return !!supabase;
};

export interface AIRequest {
  systemPrompt: string;
  userPrompt: string;
}