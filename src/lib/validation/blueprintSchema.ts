/**
 * Blueprint Validation Schemas
 * Story: SPRINT-1-P1
 */

import { z } from 'zod';

export const BlueprintContentSchema = z.object({
  title: z.string().min(1, 'Title required'),
  executive_summary: z.string().min(10, 'Summary too short'),
  problem_statement: z.string().min(10, 'Problem statement required'),
  current_state_analysis: z.string().optional(),
  proposed_solution: z.string().optional(),
  architecture_layers: z.array(
    z.object({
      name: z.string(),
      components: z.array(z.string()).optional(),
      technologies: z.array(z.string()).optional(),
      responsibilities: z.array(z.string()).optional()
    })
  ).min(1),
  technology_stack: z.array(
    z.object({
      category: z.string(),
      selected: z.string(),
      alternatives: z.array(z.string()).optional(),
      rationale: z.string().optional(),
      risk_level: z.enum(['low', 'medium', 'high']).optional()
    })
  ).optional(),
  implementation_timeline: z.array(
    z.object({
      phase: z.string(),
      duration: z.string(),
      deliverables: z.array(z.string()).optional(),
      dependencies: z.array(z.string()).optional()
    })
  ).optional(),
  risks_and_mitigations: z.array(
    z.object({
      risk: z.string(),
      probability: z.enum(['low', 'medium', 'high']).optional(),
      impact: z.enum(['low', 'medium', 'high']).optional(),
      mitigation_strategy: z.string().optional()
    })
  ).optional(),
  success_metrics: z.array(
    z.object({
      metric: z.string(),
      baseline: z.string().optional(),
      target: z.string().optional(),
      measurement_method: z.string().optional()
    })
  ).optional(),
  technicalArchitecture: z.string().optional()
});

export const SaveBlueprintSchema = z.object({
  session_id: z.string().uuid('Invalid session ID'),
  user_id: z.string().uuid().optional(),
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name required'),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  blueprint: BlueprintContentSchema,
  language: z.enum(['en', 'pt-BR']).default('en')
});

export type SaveBlueprintInput = z.infer<typeof SaveBlueprintSchema>;
export type BlueprintContent = z.infer<typeof BlueprintContentSchema>;

export function validateBlueprint(data: unknown) {
  try {
    const validated = SaveBlueprintSchema.parse(data);
    return { valid: true, data: validated, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        data: null,
        error: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      };
    }
    return {
      valid: false,
      data: null,
      error: [{ field: 'unknown', message: 'Validation error' }]
    };
  }
}
