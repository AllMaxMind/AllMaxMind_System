# Architecture Design Document
## Issue #5: Gemini AI Problem Improvement & Issue #8: Complexity Scoring

**Document ID:** ARCH-LANDING-001
**Author:** Aria (Architect)
**Date:** 2026-02-01
**Status:** Ready for Development

---

## Overview

Este documento detalha a arquitetura para duas features relacionadas:

1. **Issue #5:** "Melhorar com IA" - Integração com Gemini para melhorar texto do problema
2. **Issue #8:** Complexity Classification - Cálculo dinâmico da complexidade baseado em scores

---

## Issue #5: "Melhorar com IA" Feature

### Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────────┐
│                        LandingPage.tsx                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ProblemInputPanel                                       │   │
│  │  ┌─────────────────┐  ┌────────────────────────────┐   │   │
│  │  │   Textarea      │  │  "Melhorar com IA" Button  │   │   │
│  │  │  (problemText)  │  │  disabled={chars < 15}     │   │   │
│  │  └────────┬────────┘  └────────────┬───────────────┘   │   │
│  │           │                        │                    │   │
│  │           │      onClick()         │                    │   │
│  │           └────────────────────────┼────────────────────│   │
│  └───────────────────────────────────│─────────────────────┘   │
└──────────────────────────────────────│──────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              src/lib/ai/improveProblem.ts (NEW)                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  improveProblemStatement(text: string): Promise<string>  │   │
│  │                                                          │   │
│  │  1. Load system prompt                                   │   │
│  │  2. Call Gemini API (gemini-2.5-flash-latest)           │   │
│  │  3. Return improved text                                 │   │
│  └────────────────────────┬────────────────────────────────┘   │
└───────────────────────────│─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│     src/lib/ai/systemPrompts/problemStructuring.ts (NEW)       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  PROBLEM_STRUCTURING_PROMPT = `...`                      │   │
│  │                                                          │   │
│  │  - Transforms fragmented input into structured problem   │   │
│  │  - Maintains user intent                                 │   │
│  │  - Business-focused language                             │   │
│  │  - Portuguese (Brazil) output                            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/lib/ai/systemPrompts/problemStructuring.ts` | **CREATE** | System prompt para estruturação |
| `src/lib/ai/improveProblem.ts` | **CREATE** | Função principal de melhoria |
| `components/LandingPage.tsx` | **MODIFY** | Adicionar lógica do botão |

---

### 1. System Prompt File

**Path:** `src/lib/ai/systemPrompts/problemStructuring.ts`

```typescript
/**
 * System prompt for problem structuring with Gemini AI
 * Used by "Melhorar com IA" button on Landing Page
 */

export const PROBLEM_STRUCTURING_PROMPT = `Você é um Consultor Especialista em Diagnóstico de Problemas Empresariais.

## Sua Missão
Transformar fragmentos de texto ou descrições vagas de problemas em declarações estruturadas e claras que possam ser analisadas por uma equipe técnica.

## Regras de Transformação

1. **Manter a Essência**: Preserve o problema original do usuário. Não invente informações.

2. **Estrutura do Output**:
   - Parágrafo 1: Contexto atual e gargalo principal
   - Parágrafo 2: Impactos mensuráveis (tempo, custo, pessoas afetadas)
   - Parágrafo 3: Objetivo/necessidade clara

3. **Linguagem**:
   - Use português brasileiro formal
   - Seja específico e direto
   - Evite jargões técnicos excessivos
   - Mantenha tom profissional

4. **Tamanho**: Entre 80-200 palavras no output final.

5. **Placeholders**: Se informações estiverem faltando, use placeholders como [especifique área], [descreva processo], [informe período].

## Exemplos

**Input fragmentado:**
"aprovação despesas demora muito emails perdem"

**Output estruturado:**
"Atualmente, enfrentamos um sério gargalo no processo de aprovação de despesas. O fluxo atual depende de e-mails manuais que frequentemente se perdem ou ficam sem resposta.

Isso resulta em atrasos de até [especifique dias] para reembolsos simples. A equipe financeira gasta cerca de [especifique horas] semanais apenas cobrando gestores por aprovações pendentes.

Precisamos de um sistema que centralize as solicitações e notifique automaticamente os responsáveis, eliminando o trabalho manual e reduzindo o tempo de ciclo para [meta de tempo]."

---

**Input fragmentado:**
"estoque errado sempre falta produto cliente reclamando"

**Output estruturado:**
"Enfrentamos problemas recorrentes de acuracidade no controle de estoque. O sistema atual apresenta divergências frequentes entre o saldo registrado e o físico disponível.

Isso causa ruptura de estoque e falta de produtos para atender pedidos de clientes. As reclamações estão aumentando e estimamos perda de [especifique valor] em vendas não realizadas por indisponibilidade.

Precisamos de um sistema de gestão de estoque que sincronize em tempo real com as movimentações físicas e alerte sobre níveis críticos automaticamente."

---

## Responda APENAS com o texto melhorado, sem explicações adicionais.`;

export const IMPROVE_PROBLEM_CONFIG = {
  model: 'gemini-2.5-flash-latest',
  temperature: 0.7,
  maxOutputTokens: 500,
};
```

---

### 2. Improve Problem Service

**Path:** `src/lib/ai/improveProblem.ts`

```typescript
import { GoogleGenAI } from '@google/genai';
import {
  PROBLEM_STRUCTURING_PROMPT,
  IMPROVE_PROBLEM_CONFIG
} from './systemPrompts/problemStructuring';

// Helper to get API key
const getApiKey = (): string => {
  const key = import.meta.env?.VITE_API_KEY || process.env?.VITE_API_KEY;
  if (!key) {
    throw new Error('Gemini API Key missing. Configure VITE_API_KEY.');
  }
  return key;
};

export interface ImproveProblemResult {
  success: boolean;
  improvedText?: string;
  error?: string;
}

/**
 * Improves a fragmented problem description using Gemini AI
 * @param text - Raw user input (minimum 15 characters)
 * @returns Structured problem statement
 */
export async function improveProblemStatement(
  text: string
): Promise<ImproveProblemResult> {
  // Validation
  if (!text || text.trim().length < 15) {
    return {
      success: false,
      error: 'Texto muito curto. Mínimo de 15 caracteres.',
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const response = await ai.models.generateContent({
      model: IMPROVE_PROBLEM_CONFIG.model,
      contents: text.trim(),
      config: {
        systemInstruction: PROBLEM_STRUCTURING_PROMPT,
        temperature: IMPROVE_PROBLEM_CONFIG.temperature,
        maxOutputTokens: IMPROVE_PROBLEM_CONFIG.maxOutputTokens,
      },
    });

    const improvedText = response.text?.trim();

    if (!improvedText) {
      return {
        success: false,
        error: 'Resposta vazia da IA. Tente novamente.',
      };
    }

    return {
      success: true,
      improvedText,
    };
  } catch (error: any) {
    console.error('[ImproveProblem] Error:', error);

    // User-friendly error messages
    const errorMessage = error.message?.includes('API Key')
      ? 'Erro de configuração. Contate o suporte.'
      : error.message?.includes('quota')
      ? 'Limite de requisições atingido. Tente em alguns minutos.'
      : 'Erro ao processar. Tente novamente.';

    return {
      success: false,
      error: errorMessage,
    };
  }
}
```

---

### 3. LandingPage.tsx Modifications

**Key Changes:**

```typescript
// Add import
import { improveProblemStatement } from '../src/lib/ai/improveProblem';

// Add state for improve button
const [isImproving, setIsImproving] = useState(false);
const [canImprove, setCanImprove] = useState(false);

// Update canImprove when text changes
useEffect(() => {
  setCanImprove(problemText.trim().length >= 15);
}, [problemText]);

// Handler for improve button
const handleImproveProblem = async () => {
  if (!canImprove || isImproving) return;

  setIsImproving(true);

  try {
    const result = await improveProblemStatement(problemText);

    if (result.success && result.improvedText) {
      setProblemText(result.improvedText);
      toast.success('Texto melhorado com sucesso!');
    } else {
      toast.error(result.error || 'Erro ao melhorar texto.');
    }
  } catch (error) {
    toast.error('Erro inesperado. Tente novamente.');
  } finally {
    setIsImproving(false);
  }
};

// Button JSX
<button
  onClick={handleImproveProblem}
  disabled={!canImprove || isImproving}
  className={`btn-secondary flex items-center gap-2 ${
    !canImprove ? 'opacity-50 cursor-not-allowed' : ''
  }`}
>
  {isImproving ? (
    <>
      <LoadingSpinner size="sm" />
      Refinando...
    </>
  ) : (
    <>
      <Sparkles className={`w-4 h-4 ${canImprove ? 'animate-spin-slow' : ''}`} />
      Melhorar com IA
    </>
  )}
</button>

// Badge visibility (during processing)
{isImproving && (
  <div className="absolute bottom-4 right-4 px-3 py-1 bg-teal-500/20 border border-teal-500/30 rounded-full flex items-center gap-2">
    <span className="w-2 h-2 bg-teal-500 rounded-full animate-ping" />
    <span className="text-xs font-medium text-teal-300">IA REFINANDO...</span>
  </div>
)}
```

---

## Issue #8: Complexity Scoring Architecture

### Problema Atual

A classificação de complexidade está **hardcoded** como "Médio". Precisamos:

1. Calcular score baseado nas **dimensões selecionadas** (Phase 2)
2. **Recalcular** baseado nas **respostas das perguntas** (Phase 4)
3. Exibir complexidade **dinâmica** no badge

### Arquitetura do Scoring

```
┌─────────────────────────────────────────────────────────────────┐
│                        SCORING FLOW                             │
└─────────────────────────────────────────────────────────────────┘

Phase 2: Dimension Selection
┌─────────────────────────────────────────────────────────────────┐
│  dimensions[] → calculateDimensionComplexity() → initialScore   │
│                                                                 │
│  Input:                                                         │
│  - frequency: impactScore (1-10)                                │
│  - impact: impactScore (1-10)                                   │
│  - urgency: impactScore (1-10)                                  │
│  - resources: impactScore[] (multi-select average)              │
│  - business_area: impactScore[] (multi-select average)          │
│                                                                 │
│  Formula:                                                       │
│  avgScore = sum(all impactScores) / count                       │
│  complexity = avgScore >= 7 ? 'large' :                         │
│               avgScore >= 4 ? 'medium' : 'small'                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
Phase 3: Custom Questions (existing)
┌─────────────────────────────────────────────────────────────────┐
│  questionsAnswers[] → calculateQuestionBonus() → bonusScore     │
│                                                                 │
│  Input:                                                         │
│  - Question responses with category weights                     │
│  - 'technical' & 'scale' categories add +1 to complexity        │
│  - Long answers (>100 chars) indicate more detail = +0.5        │
│                                                                 │
│  Output:                                                        │
│  - bonusScore: 0-3 points                                       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
Final Complexity Calculation
┌─────────────────────────────────────────────────────────────────┐
│  calculateFinalComplexity(initialScore, bonusScore)             │
│                                                                 │
│  finalScore = initialScore + bonusScore                         │
│                                                                 │
│  Output:                                                        │
│  - finalScore >= 8.0 → 'large'                                  │
│  - finalScore >= 5.0 → 'medium'                                 │
│  - finalScore <  5.0 → 'small'                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Arquivos a Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/lib/leads/scorer.ts` | **MODIFY** | Adicionar funções de complexity |
| `components/phases/Phase2.tsx` | **MODIFY** | Passar score calculado |
| `App.tsx` ou Context | **MODIFY** | Manter state do complexity score |
| `src/components/phases/Phase4.tsx` | **MODIFY** | Usar score dinâmico |

---

### 1. Enhanced Scorer (scorer.ts)

**Adicionar ao arquivo existente:**

```typescript
// ============================================
// COMPLEXITY SCORING (Issue #8)
// ============================================

export type Complexity = 'small' | 'medium' | 'large';

export interface DimensionInput {
  dimensionId: string;
  selectedOptionIds: string[];
  impactScore: number; // Average of selected options
}

export interface QuestionInput {
  category: 'context' | 'process' | 'pain' | 'technical' | 'scale';
  answerLength: number;
}

/**
 * Calculate complexity from Phase 2 dimension selections
 */
export function calculateDimensionComplexity(
  dimensions: DimensionInput[]
): { score: number; complexity: Complexity } {
  if (!dimensions || dimensions.length === 0) {
    return { score: 5, complexity: 'medium' }; // Default
  }

  // Calculate average impact score across all dimensions
  const totalScore = dimensions.reduce((sum, dim) => sum + dim.impactScore, 0);
  const avgScore = totalScore / dimensions.length;

  // Map to complexity
  const complexity: Complexity =
    avgScore >= 7 ? 'large' :
    avgScore >= 4 ? 'medium' : 'small';

  return { score: avgScore, complexity };
}

/**
 * Calculate bonus score from Phase 4 question answers
 */
export function calculateQuestionBonus(
  questions: QuestionInput[]
): number {
  if (!questions || questions.length === 0) {
    return 0;
  }

  let bonus = 0;

  questions.forEach(q => {
    // Technical and scale questions indicate higher complexity
    if (q.category === 'technical' || q.category === 'scale') {
      bonus += 0.5;
    }

    // Detailed answers (>100 chars) suggest more complex problem
    if (q.answerLength > 100) {
      bonus += 0.25;
    }

    // Very detailed answers (>300 chars)
    if (q.answerLength > 300) {
      bonus += 0.25;
    }
  });

  // Cap bonus at 3 points
  return Math.min(bonus, 3);
}

/**
 * Calculate final complexity combining dimensions and questions
 */
export function calculateFinalComplexity(
  dimensionScore: number,
  questionBonus: number
): { score: number; complexity: Complexity } {
  const finalScore = dimensionScore + questionBonus;

  const complexity: Complexity =
    finalScore >= 8.0 ? 'large' :
    finalScore >= 5.0 ? 'medium' : 'small';

  return { score: finalScore, complexity };
}

/**
 * Get complexity display info
 */
export function getComplexityDisplay(complexity: Complexity): {
  label: string;
  labelEn: string;
  color: string;
  bgColor: string;
  timeline: string;
  investment: string;
} {
  const displays = {
    small: {
      label: 'Baixa',
      labelEn: 'Low',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      timeline: '10-15 dias',
      investment: 'R$ 15.000 - R$ 30.000',
    },
    medium: {
      label: 'Média',
      labelEn: 'Medium',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      timeline: '20-30 dias',
      investment: 'R$ 30.000 - R$ 60.000',
    },
    large: {
      label: 'Alta',
      labelEn: 'High',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      timeline: '40-60 dias',
      investment: 'R$ 60.000 - R$ 120.000+',
    },
  };

  return displays[complexity];
}
```

---

### 2. Phase 2 Integration

**Modificar `Phase2.tsx`:**

```typescript
// Import new scoring function
import { calculateDimensionComplexity, Complexity } from '../../lib/leads/scorer';

// Update onComplete callback signature
interface Phase2Props {
  // ... existing
  onComplete: (
    selections: DimensionSelection[],
    refinedIntentScore: number,
    complexity: Complexity  // ADD THIS
  ) => void;
}

// Calculate complexity before calling onComplete
const handleNext = async () => {
  // ... existing code ...

  const dimensionSelections: DimensionSelection[] = /* existing */;
  const refinedScore = calculateRefinedIntentScore();

  // NEW: Calculate complexity
  const dimensionInputs = dimensionSelections.map(ds => ({
    dimensionId: ds.dimensionId,
    selectedOptionIds: ds.selectedOptionIds,
    impactScore: ds.impactScore,
  }));

  const { complexity } = calculateDimensionComplexity(dimensionInputs);

  // Pass complexity to parent
  onComplete(dimensionSelections, refinedScore, complexity);
};
```

---

### 3. App.tsx or Context State

**Manter o estado de complexity no nível superior:**

```typescript
// State
const [complexity, setComplexity] = useState<Complexity>('medium');

// Handler from Phase 2
const handlePhase2Complete = (
  selections: DimensionSelection[],
  score: number,
  calculatedComplexity: Complexity
) => {
  setDimensions(selections);
  setIntentScore(score);
  setComplexity(calculatedComplexity); // Store calculated value
  setCurrentPhase(3);
};

// Pass to Phase 4
<Phase4
  complexity={complexity}  // Dynamic value, not hardcoded
  // ... other props
/>
```

---

### 4. Phase 4 Recalculation

**Após responder perguntas, recalcular:**

```typescript
// In Phase4.tsx, after questions are answered
import {
  calculateQuestionBonus,
  calculateFinalComplexity,
  getComplexityDisplay
} from '../../lib/leads/scorer';

// When questions are answered (if applicable in Phase 4)
const recalculateComplexity = (answers: QuestionAnswer[]) => {
  const questionInputs = answers.map(a => ({
    category: a.category,
    answerLength: a.answer?.length || 0,
  }));

  const bonus = calculateQuestionBonus(questionInputs);
  const dimensionScore = /* get from context or props */;

  const { complexity: finalComplexity } = calculateFinalComplexity(
    dimensionScore,
    bonus
  );

  // Update local state or context
  setComplexity(finalComplexity);
};
```

---

## Dependency Graph

```
Issue #5 Dependencies:
├── src/lib/ai/systemPrompts/problemStructuring.ts (NEW)
├── src/lib/ai/improveProblem.ts (NEW)
└── components/LandingPage.tsx (MODIFY)

Issue #8 Dependencies:
├── src/lib/leads/scorer.ts (MODIFY - add complexity functions)
├── components/phases/Phase2.tsx (MODIFY - pass complexity)
├── App.tsx (MODIFY - state management)
└── src/components/phases/Phase4.tsx (MODIFY - use dynamic complexity)

Shared:
├── Types (Complexity type exported from scorer.ts)
└── i18n (complexity labels in translation files)
```

---

## Testing Checklist

### Issue #5 Tests

- [ ] Button disabled when text < 15 chars
- [ ] Button enabled when text >= 15 chars
- [ ] "IA REFINANDO..." badge shows during processing
- [ ] Textarea updates with improved text
- [ ] Toast shows success message
- [ ] Error handling shows appropriate messages
- [ ] API errors don't crash the app

### Issue #8 Tests

- [ ] Small complexity when low-impact options selected
- [ ] Medium complexity when medium-impact options selected
- [ ] Large complexity when high-impact options selected
- [ ] Complexity recalculates after Phase 4 questions
- [ ] Badge displays correct complexity label
- [ ] Timeline/Investment reflects complexity level
- [ ] No hardcoded "Médio" values remaining

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| API rate limits | Implement retry logic with exponential backoff |
| Long API response times | Show loading state, consider timeout |
| Invalid API responses | Validate response, show fallback error |
| State sync issues | Use React Context for complexity state |
| Calculation edge cases | Add unit tests for scoring functions |

---

## Acceptance Criteria

### Issue #5
1. Button "Melhorar com IA" disabled until 15+ chars
2. API call to Gemini with proper system prompt
3. Text replaced with improved version
4. Proper loading/error states
5. "IA REFINANDO..." badge during processing

### Issue #8
1. Complexity calculated from Phase 2 dimensions
2. Complexity recalculated after Phase 4 questions
3. No hardcoded "Médio" values
4. Badge, timeline, and investment reflect actual complexity
5. Scoring algorithm is deterministic and testable

---

*— Aria, arquitetando o futuro 🏗️*
