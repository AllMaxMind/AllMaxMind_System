/**
 * Blueprint Tests
 * Story: SPRINT-1-P1
 */

import { describe, it, expect } from 'vitest';
import { validateBlueprint } from '../lib/validation/blueprintSchema';
import { validateBlueprintContent } from '../lib/pdf/blueprintGenerator';

describe('Blueprint Validation', () => {
  const validBlueprint = {
    session_id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    name: 'John Doe',
    phone: '+55 11 98765-4321',
    company: 'Tech Corp',
    role: 'CTO',
    blueprint: {
      title: 'Microservices Architecture',
      executive_summary: 'Comprehensive microservices-based architecture for scalable systems',
      problem_statement: 'Current monolith cannot scale to handle increasing load',
      architecture_layers: [
        {
          name: 'API Gateway',
          components: ['Kong', 'Traefik'],
          technologies: ['Kubernetes', 'Docker']
        }
      ]
    },
    language: 'en' as const
  };

  it('should validate correct blueprint data', () => {
    const result = validateBlueprint(validBlueprint);
    expect(result.valid).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.error).toBeNull();
  });

  it('should reject invalid email', () => {
    const invalid = {
      ...validBlueprint,
      email: 'invalid-email'
    };
    const result = validateBlueprint(invalid);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should reject invalid UUID session_id', () => {
    const invalid = {
      ...validBlueprint,
      session_id: 'not-a-uuid'
    };
    const result = validateBlueprint(invalid);
    expect(result.valid).toBe(false);
  });

  it('should reject missing required fields', () => {
    const invalid = {
      session_id: validBlueprint.session_id,
      email: validBlueprint.email,
      blueprint: validBlueprint.blueprint
    };
    const result = validateBlueprint(invalid);
    expect(result.valid).toBe(false);
  });

  it('should accept optional fields as undefined', () => {
    const minimal = {
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com',
      name: 'John Doe',
      blueprint: {
        title: 'Architecture',
        executive_summary: 'Summary description here',
        problem_statement: 'Problem statement here',
        architecture_layers: [
          {
            name: 'Layer 1',
            components: ['Comp1']
          }
        ]
      },
      language: 'pt-BR' as const
    };
    const result = validateBlueprint(minimal);
    expect(result.valid).toBe(true);
  });

  it('should validate blueprint content for PDF generation', () => {
    // validateBlueprintContent expects camelCase properties
    const blueprintContent = {
      title: validBlueprint.blueprint.title,
      executiveSummary: validBlueprint.blueprint.executive_summary,
      problemStatement: validBlueprint.blueprint.problem_statement,
      architectureLayers: validBlueprint.blueprint.architecture_layers
    };
    const validation = validateBlueprintContent(blueprintContent as any);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should reject blueprint content missing required fields', () => {
    const incomplete = {
      title: 'Architecture'
      // missing other required fields
    };
    const validation = validateBlueprintContent(incomplete as any);
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  it('should support Portuguese language', () => {
    const ptBlueprint = {
      ...validBlueprint,
      language: 'pt-BR' as const
    };
    const result = validateBlueprint(ptBlueprint);
    expect(result.valid).toBe(true);
    expect(result.data?.language).toBe('pt-BR');
  });

  it('should support English language', () => {
    const enBlueprint = {
      ...validBlueprint,
      language: 'en' as const
    };
    const result = validateBlueprint(enBlueprint);
    expect(result.valid).toBe(true);
    expect(result.data?.language).toBe('en');
  });

  it('should default to English if language not specified', () => {
    const noLanguage = {
      ...validBlueprint
    };
    delete (noLanguage as any).language;
    const result = validateBlueprint(noLanguage);
    expect(result.valid).toBe(true);
    expect(result.data?.language).toBe('en');
  });
});

describe('Blueprint Edge Cases', () => {
  it('should handle very long strings', () => {
    const longText = 'a'.repeat(10000);
    const blueprint = {
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com',
      name: 'John Doe',
      blueprint: {
        title: longText,
        executive_summary: longText,
        problem_statement: longText,
        architecture_layers: [
          {
            name: 'Layer',
            components: ['Component']
          }
        ]
      }
    };
    const result = validateBlueprint(blueprint);
    expect(result.valid).toBe(true);
  });

  it('should handle special characters in names', () => {
    const blueprint = {
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com',
      name: 'João da Silva Pereira',
      company: 'Empresas & Cia Ltda',
      blueprint: {
        title: 'Arquitetura "Avançada"',
        executive_summary: 'Resumo com acentuação: é, ã, ó',
        problem_statement: 'Problema com símbolos: @, #, $',
        architecture_layers: [
          {
            name: 'Camada Apresentação',
            components: ['React.js', 'Vue.js']
          }
        ]
      }
    };
    const result = validateBlueprint(blueprint);
    expect(result.valid).toBe(true);
  });

  it('should handle empty optional arrays', () => {
    const blueprint = {
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com',
      name: 'John Doe',
      blueprint: {
        title: 'Architecture',
        executive_summary: 'Summary description here for validation',
        problem_statement: 'Problem statement here for validation',
        architecture_layers: [
          {
            name: 'Layer',
            components: [],
            technologies: []
          }
        ],
        technology_stack: [],
        implementation_timeline: []
      }
    };
    const result = validateBlueprint(blueprint);
    expect(result.valid).toBe(true);
  });
});
