# Story SPRINT-3.3: Remover Blueprint Fallback Mockado

**Sprint:** 3 - Funcionalidade Core
**Prioridade:** CRITICA
**Owner:** @dev
**Status:** [ ] Pendente

---

## Objetivo

Eliminar o fallback de blueprint com dados estaticos, implementando tratamento de erro adequado que informe o usuario sem mostrar dados falsos.

---

## Contexto

**Problema Atual:**
O arquivo `lib/ai/blueprint.ts:68-98` contem um fallback que retorna SEMPRE os mesmos dados quando a API falha:

```typescript
const generateFallbackBlueprint = (input: BlueprintInput): Blueprint => {
  return {
    objectives: ['Otimizacao de Processos', 'Reducao de Custos', 'Automacao'],
    technicalArchitecture: ['Cloud Native', 'API First', 'Supabase', 'React'],
    keyFeatures: ['Painel de Controle', 'Automacao de Fluxo', 'Relatorios'],
    successMetrics: ['ROI > 150%', 'Reducao de tempo em 60%'],
    risksAndMitigations: ['Risco: Adocao -> Mitigacao: Treinamento'],
    nextSteps: ['Agendar Validacao Tecnica'],
    // ... SEMPRE OS MESMOS DADOS FAKE
  };
};
```

**Impacto:** Usuario recebe dados genericos que NAO refletem seu problema real, gerando expectativa falsa.

---

## Criterios de Aceite

- [ ] Fallback mockado REMOVIDO completamente
- [ ] Erro de API tratado com mensagem clara ao usuario
- [ ] Botao de "Tentar Novamente" disponivel
- [ ] Loading state durante geracao
- [ ] Timeout configuravel (default 60s)
- [ ] Log de erros para debugging
- [ ] Se erro persistir, oferecer contato via WhatsApp

---

## Tasks

### Task 3.3.1 - Remover Fallback Mockado
- [ ] Deletar funcao `generateFallbackBlueprint`
- [ ] Modificar catch para lancar erro
- [ ] Adicionar tipagem de erro customizada

**Arquivo:** `lib/ai/blueprint.ts`

### Task 3.3.2 - Implementar Error State no Phase4
- [ ] Criar estado de erro no componente
- [ ] UI de erro com opcao de retry
- [ ] Botao de contato alternativo (WhatsApp)

**Arquivo:** `src/components/phases/Phase4.tsx`

### Task 3.3.3 - Adicionar Timeout Configuravel
- [ ] Timeout de 60s para geracao
- [ ] Mensagem especifica para timeout
- [ ] AbortController para cancelar request

---

## Especificacao Tecnica

### Refatoracao do blueprint.ts

```typescript
// lib/ai/blueprint.ts

export class BlueprintGenerationError extends Error {
  constructor(
    message: string,
    public readonly code: 'API_ERROR' | 'TIMEOUT' | 'INVALID_RESPONSE' | 'NETWORK_ERROR',
    public readonly retryable: boolean = true
  ) {
    super(message)
    this.name = 'BlueprintGenerationError'
  }
}

export const generateTechnicalBlueprint = async (
  input: BlueprintInput,
  options: { timeout?: number } = {}
): Promise<Blueprint> => {
  const { timeout = 60000 } = options // 60 segundos default

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    console.log('[Blueprint] Invoking Edge Function...')

    const { data, error } = await supabase.functions.invoke('generate-blueprint', {
      body: {
        problemText: input.problemText,
        dimensions: input.dimensions,
        answers: input.questionsAnswers,
        complexity: input.complexity
      }
    })

    clearTimeout(timeoutId)

    if (error) {
      console.error('[Blueprint] Edge Function error:', error)
      throw new BlueprintGenerationError(
        'Falha ao gerar blueprint. Por favor, tente novamente.',
        'API_ERROR',
        true
      )
    }

    if (!data || !data.title) {
      throw new BlueprintGenerationError(
        'Resposta invalida do servidor. Por favor, tente novamente.',
        'INVALID_RESPONSE',
        true
      )
    }

    // Validar campos obrigatorios
    const requiredFields = ['title', 'executiveSummary', 'objectives']
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new BlueprintGenerationError(
          `Blueprint incompleto: campo ${field} ausente.`,
          'INVALID_RESPONSE',
          true
        )
      }
    }

    return {
      id: `bp_${Date.now()}_secure`,
      title: data.title,
      executiveSummary: data.executiveSummary,
      problemStatement: data.problemStatement || input.problemText,
      objectives: data.objectives || [],
      technicalArchitecture: data.technicalArchitecture || [],
      keyFeatures: data.keyFeatures || [],
      timelineEstimate: data.timelineEstimate || getDefaultTimeline(input.complexity),
      projectSize: input.complexity,
      estimatedInvestment: data.estimatedInvestment || getDefaultInvestment(input.complexity),
      successMetrics: data.successMetrics || [],
      risksAndMitigations: data.risksAndMitigations || [],
      nextSteps: data.nextSteps || [],
      createdAt: new Date()
    }

  } catch (error: any) {
    clearTimeout(timeoutId)

    // Timeout especifico
    if (error.name === 'AbortError') {
      throw new BlueprintGenerationError(
        'Geracao demorou muito. Por favor, tente novamente.',
        'TIMEOUT',
        true
      )
    }

    // Erro de rede
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      throw new BlueprintGenerationError(
        'Erro de conexao. Verifique sua internet e tente novamente.',
        'NETWORK_ERROR',
        true
      )
    }

    // Ja e BlueprintGenerationError
    if (error instanceof BlueprintGenerationError) {
      throw error
    }

    // Erro generico
    console.error('[Blueprint] Unexpected error:', error)
    throw new BlueprintGenerationError(
      'Erro inesperado. Por favor, tente novamente ou entre em contato.',
      'API_ERROR',
      true
    )
  }
}

// Helpers para valores default (NAO mockados, apenas ranges)
function getDefaultTimeline(complexity: string): string {
  const map = { small: '2-3 semanas', medium: '4-6 semanas', large: '8-12 semanas' }
  return map[complexity] || '4-6 semanas'
}

function getDefaultInvestment(complexity: string): string {
  const map = {
    small: 'R$ 15.000 - R$ 30.000',
    medium: 'R$ 30.000 - R$ 60.000',
    large: 'R$ 60.000 - R$ 120.000+'
  }
  return map[complexity] || 'Sob consulta'
}

// REMOVER COMPLETAMENTE:
// const generateFallbackBlueprint = ...
```

### Error State no Phase4

```typescript
// src/components/phases/Phase4.tsx

import { BlueprintGenerationError } from '../../lib/ai/blueprint'

// Adicionar estados:
const [blueprintError, setBlueprintError] = useState<BlueprintGenerationError | null>(null)
const [isGenerating, setIsGenerating] = useState(false)
const [retryCount, setRetryCount] = useState(0)

const generateBlueprintContent = async () => {
  setIsGenerating(true)
  setBlueprintError(null)

  try {
    const blueprint = await generateTechnicalBlueprint({
      problemText,
      dimensions,
      questionsAnswers,
      complexity
    })
    setGeneratedBlueprint(blueprint)
    setRetryCount(0)
  } catch (error) {
    console.error('[Phase4] Blueprint generation error:', error)

    if (error instanceof BlueprintGenerationError) {
      setBlueprintError(error)
    } else {
      setBlueprintError(new BlueprintGenerationError(
        'Erro inesperado. Tente novamente.',
        'API_ERROR',
        true
      ))
    }
  } finally {
    setIsGenerating(false)
  }
}

const handleRetry = () => {
  setRetryCount(prev => prev + 1)
  generateBlueprintContent()
}

// No JSX, adicionar UI de erro:
{blueprintError && (
  <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-xl">
    <div className="flex items-start gap-4">
      <div className="p-3 bg-red-500/20 rounded-full">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-red-400 mb-2">
          Erro ao Gerar Blueprint
        </h3>
        <p className="text-ds-text-secondary mb-4">
          {blueprintError.message}
        </p>

        <div className="flex flex-wrap gap-3">
          {blueprintError.retryable && retryCount < 3 && (
            <button
              onClick={handleRetry}
              disabled={isGenerating}
              className="btn-primary flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size="sm" />
                  Gerando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Tentar Novamente ({3 - retryCount} restantes)
                </>
              )}
            </button>
          )}

          <button
            onClick={handleWhatsAppRedirect}
            className="btn-secondary flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Falar com Especialista
          </button>
        </div>

        {retryCount >= 3 && (
          <p className="mt-4 text-sm text-yellow-400">
            Limite de tentativas atingido. Por favor, entre em contato conosco.
          </p>
        )}
      </div>
    </div>
  </div>
)}
```

---

## Validacao

### Cenarios de Teste

| Cenario | Comportamento Esperado |
|---------|------------------------|
| API retorna sucesso | Blueprint exibido normalmente |
| API retorna erro 500 | Mensagem de erro + botao retry |
| Timeout (>60s) | Mensagem de timeout + botao retry |
| Sem internet | Mensagem de rede + botao retry |
| 3 retries falharam | Oferecer contato WhatsApp |

---

## Checklist Final

- [ ] Funcao `generateFallbackBlueprint` DELETADA
- [ ] Error class `BlueprintGenerationError` criada
- [ ] Timeout implementado
- [ ] UI de erro no Phase4
- [ ] Botao retry funcional
- [ ] Maximo 3 retries
- [ ] Oferta de WhatsApp apos falhas
- [ ] Logs de erro para debugging
- [ ] Testes em staging

---

*Story criada por @architect (Aria) - Sprint 3*
