# Story SPRINT-3.5: Adicionar OpenAI como Fallback

**Sprint:** 3 - Funcionalidade Core
**Prioridade:** ALTA
**Owner:** @dev
**Status:** [ ] Pendente

---

## Objetivo

Implementar OpenAI como provider de fallback quando o Gemini falhar, garantindo alta disponibilidade da geracao de blueprints e perguntas.

---

## Contexto

**Requisito PRD:**
```typescript
providers: {
  gemini: { fallbackTo: 'openai' },
  openai: { /* config */ }
}
```

**Estado Atual:** Sistema usa APENAS Gemini. Se Gemini falhar, o sistema retorna erro (apos remocao do mock na Story 3.3).

---

## Criterios de Aceite

- [ ] OpenAI configurado como fallback
- [ ] Se Gemini falhar, OpenAI assume automaticamente
- [ ] Log indica qual provider foi usado
- [ ] Timeout individual por provider
- [ ] Metricas de uso por provider
- [ ] Custo por requisicao trackeado
- [ ] Configuracao via env vars

---

## Tasks

### Task 3.5.1 - Criar Abstração de AI Provider
- [ ] Interface comum para providers
- [ ] Factory para selecao de provider
- [ ] Logica de fallback

**Arquivo Novo:** `lib/ai/providers/index.ts`

### Task 3.5.2 - Implementar Provider Gemini
- [ ] Adapter para API Gemini
- [ ] Configuracao especifica
- [ ] Error handling

**Arquivo Novo:** `lib/ai/providers/gemini.ts`

### Task 3.5.3 - Implementar Provider OpenAI
- [ ] Adapter para API OpenAI
- [ ] Configuracao especifica
- [ ] Error handling

**Arquivo Novo:** `lib/ai/providers/openai.ts`

### Task 3.5.4 - Refatorar Edge Functions
- [ ] `generate-blueprint` usar abstração
- [ ] `generate-questions` usar abstração
- [ ] `analyze-problem` usar abstração

### Task 3.5.5 - Adicionar Metricas
- [ ] Logar provider usado
- [ ] Tempo de resposta
- [ ] Custo estimado

---

## Especificacao Tecnica

### Abstração de Provider

```typescript
// lib/ai/providers/index.ts

export interface AIProvider {
  name: string
  generateCompletion(params: CompletionParams): Promise<CompletionResult>
  generateEmbedding?(text: string): Promise<number[]>
}

export interface CompletionParams {
  systemPrompt: string
  userPrompt: string
  maxTokens?: number
  temperature?: number
  responseFormat?: 'json' | 'text'
}

export interface CompletionResult {
  content: string
  provider: string
  tokensUsed: number
  latencyMs: number
}

export interface AIConfig {
  primaryProvider: 'gemini' | 'openai'
  fallbackProvider?: 'gemini' | 'openai'
  providers: {
    gemini?: {
      apiKey: string
      model: string
      maxTokens: number
      temperature: number
    }
    openai?: {
      apiKey: string
      organization?: string
      model: string
      maxTokens: number
      temperature: number
    }
  }
}

export const defaultConfig: AIConfig = {
  primaryProvider: 'gemini',
  fallbackProvider: 'openai',
  providers: {
    gemini: {
      apiKey: '', // Set via env
      model: 'gemini-1.5-pro',
      maxTokens: 8192,
      temperature: 0.2
    },
    openai: {
      apiKey: '', // Set via env
      model: 'gpt-4-turbo-preview',
      maxTokens: 4096,
      temperature: 0.3
    }
  }
}

export class AIProviderManager {
  private primaryProvider: AIProvider
  private fallbackProvider?: AIProvider

  constructor(config: AIConfig) {
    this.primaryProvider = this.createProvider(config.primaryProvider, config)
    if (config.fallbackProvider) {
      this.fallbackProvider = this.createProvider(config.fallbackProvider, config)
    }
  }

  private createProvider(type: string, config: AIConfig): AIProvider {
    switch (type) {
      case 'gemini':
        return new GeminiProvider(config.providers.gemini!)
      case 'openai':
        return new OpenAIProvider(config.providers.openai!)
      default:
        throw new Error(`Unknown provider: ${type}`)
    }
  }

  async generateCompletion(params: CompletionParams): Promise<CompletionResult> {
    const startTime = Date.now()

    try {
      console.log(`[AI] Trying primary provider: ${this.primaryProvider.name}`)
      const result = await this.primaryProvider.generateCompletion(params)
      console.log(`[AI] Success with ${result.provider} in ${result.latencyMs}ms`)
      return result

    } catch (primaryError) {
      console.error(`[AI] Primary provider failed:`, primaryError)

      if (this.fallbackProvider) {
        console.log(`[AI] Trying fallback provider: ${this.fallbackProvider.name}`)
        try {
          const result = await this.fallbackProvider.generateCompletion(params)
          console.log(`[AI] Fallback success with ${result.provider} in ${result.latencyMs}ms`)
          return result
        } catch (fallbackError) {
          console.error(`[AI] Fallback provider also failed:`, fallbackError)
          throw new Error('All AI providers failed')
        }
      }

      throw primaryError
    }
  }
}
```

### Provider Gemini

```typescript
// lib/ai/providers/gemini.ts

import { GoogleGenerativeAI } from '@google/generative-ai'
import { AIProvider, CompletionParams, CompletionResult } from './index'

interface GeminiConfig {
  apiKey: string
  model: string
  maxTokens: number
  temperature: number
}

export class GeminiProvider implements AIProvider {
  name = 'gemini'
  private client: GoogleGenerativeAI
  private config: GeminiConfig

  constructor(config: GeminiConfig) {
    this.config = config
    this.client = new GoogleGenerativeAI(config.apiKey)
  }

  async generateCompletion(params: CompletionParams): Promise<CompletionResult> {
    const startTime = Date.now()

    const model = this.client.getGenerativeModel({
      model: this.config.model,
      generationConfig: {
        maxOutputTokens: params.maxTokens || this.config.maxTokens,
        temperature: params.temperature || this.config.temperature,
      }
    })

    const prompt = `${params.systemPrompt}\n\n${params.userPrompt}`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    return {
      content: text,
      provider: this.name,
      tokensUsed: response.usageMetadata?.totalTokenCount || 0,
      latencyMs: Date.now() - startTime
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const model = this.client.getGenerativeModel({
      model: 'text-embedding-004'
    })

    const result = await model.embedContent(text)
    return result.embedding.values
  }
}
```

### Provider OpenAI

```typescript
// lib/ai/providers/openai.ts

import OpenAI from 'openai'
import { AIProvider, CompletionParams, CompletionResult } from './index'

interface OpenAIConfig {
  apiKey: string
  organization?: string
  model: string
  maxTokens: number
  temperature: number
}

export class OpenAIProvider implements AIProvider {
  name = 'openai'
  private client: OpenAI
  private config: OpenAIConfig

  constructor(config: OpenAIConfig) {
    this.config = config
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organization
    })
  }

  async generateCompletion(params: CompletionParams): Promise<CompletionResult> {
    const startTime = Date.now()

    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userPrompt }
      ],
      max_tokens: params.maxTokens || this.config.maxTokens,
      temperature: params.temperature || this.config.temperature,
      response_format: params.responseFormat === 'json'
        ? { type: 'json_object' }
        : undefined
    })

    const content = response.choices[0]?.message?.content || ''

    return {
      content,
      provider: this.name,
      tokensUsed: response.usage?.total_tokens || 0,
      latencyMs: Date.now() - startTime
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    })

    return response.data[0].embedding
  }
}
```

### Refatoracao Edge Function generate-blueprint

```typescript
// supabase/functions/generate-blueprint/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { AIProviderManager, defaultConfig } from './providers/index.ts'

serve(async (req) => {
  // ... CORS handling

  try {
    const { problemText, dimensions, answers, complexity } = await req.json()

    // Configurar providers com env vars
    const config = {
      ...defaultConfig,
      providers: {
        gemini: {
          ...defaultConfig.providers.gemini,
          apiKey: Deno.env.get('GEMINI_API_KEY') || ''
        },
        openai: {
          ...defaultConfig.providers.openai,
          apiKey: Deno.env.get('OPENAI_API_KEY') || ''
        }
      }
    }

    const aiManager = new AIProviderManager(config)

    const systemPrompt = `Voce e um arquiteto de software especialista em logistica...`

    const userPrompt = `
      PROBLEMA: ${problemText}
      DIMENSOES: ${JSON.stringify(dimensions)}
      RESPOSTAS: ${JSON.stringify(answers)}
      COMPLEXIDADE: ${complexity}

      Gere um blueprint tecnico em JSON...
    `

    const result = await aiManager.generateCompletion({
      systemPrompt,
      userPrompt,
      responseFormat: 'json',
      maxTokens: 4096
    })

    // Parse JSON
    const blueprint = JSON.parse(result.content)

    // Log metricas
    console.log(`[generate-blueprint] Provider: ${result.provider}, Tokens: ${result.tokensUsed}, Latency: ${result.latencyMs}ms`)

    return new Response(JSON.stringify({
      ...blueprint,
      _meta: {
        provider: result.provider,
        latencyMs: result.latencyMs
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[generate-blueprint] Error:', error)
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
```

---

## Variaveis de Ambiente

```bash
# Supabase Secrets
supabase secrets set GEMINI_API_KEY=xxx
supabase secrets set OPENAI_API_KEY=sk-xxx
supabase secrets set OPENAI_ORGANIZATION=org-xxx  # Opcional
```

---

## Metricas e Logging

### Estrutura de Log

```json
{
  "timestamp": "2026-01-30T10:00:00Z",
  "function": "generate-blueprint",
  "primaryProvider": "gemini",
  "usedProvider": "openai",
  "fallbackUsed": true,
  "tokensUsed": 2500,
  "latencyMs": 3200,
  "success": true
}
```

### Tabela de Metricas (Opcional)

```sql
-- supabase/migrations/00012_create_ai_metrics.sql
CREATE TABLE IF NOT EXISTS ai_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  primary_provider TEXT NOT NULL,
  used_provider TEXT NOT NULL,
  fallback_used BOOLEAN DEFAULT FALSE,
  tokens_used INTEGER,
  latency_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_metrics_date ON ai_metrics(created_at);
CREATE INDEX idx_ai_metrics_provider ON ai_metrics(used_provider);
```

---

## Custos Estimados

| Provider | Modelo | Input (1K tokens) | Output (1K tokens) |
|----------|--------|-------------------|-------------------|
| Gemini | gemini-1.5-pro | $0.00125 | $0.005 |
| OpenAI | gpt-4-turbo | $0.01 | $0.03 |

**Estrategia:** Usar Gemini como primario (mais barato), OpenAI como fallback.

---

## Checklist Final

- [ ] Interface AIProvider criada
- [ ] GeminiProvider implementado
- [ ] OpenAIProvider implementado
- [ ] AIProviderManager com fallback
- [ ] Edge function generate-blueprint refatorada
- [ ] Edge function generate-questions refatorada
- [ ] Edge function analyze-problem refatorada
- [ ] Env vars configuradas
- [ ] Logs de metricas funcionando
- [ ] Teste de fallback (desabilitar Gemini key)
- [ ] Deploy em staging

---

*Story criada por @architect (Aria) - Sprint 3*
