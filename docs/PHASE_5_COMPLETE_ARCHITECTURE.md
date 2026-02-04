# 🔥 FASE 5 - COMPLETE ARCHITECTURE & IMPLEMENTATION PLAN
**All Max Mind System - Hot Lead Conversion**

**Data:** 30/01/2026
**Arquiteto Responsável:** Aria (Visionary)
**PO Responsável:** Pax (Balancer)
**Status:** 📋 Ready for Development

---

## 📋 ÍNDICE RÁPIDO

1. [Executive Summary](#executive-summary)
2. [Modelo Arquitetônico Escolhido](#modelo-arquitetônico-escolhido)
3. [Stories Críticos Sprint 3](#stories-críticos-sprint-3-fixescríticos)
4. [Stories Fase 5 Sprint 4](#stories-fase-5-sprint-4)
5. [Database Schema Completo](#database-schema-completo)
6. [API Contracts](#api-contracts)
7. [Componentes React](#componentes-react)
8. [Lead Scoring System](#lead-scoring-system-hybrid)
9. [WhatsApp Business API Integration](#whatsapp-business-api-integration)
10. [Admin Dashboard Architecture](#admin-dashboard-architecture)
11. [Email Sequences & Automation](#email-sequences--automation)
12. [Performance & Monitoring](#performance--monitoring)
13. [Deployment & Go-Live](#deployment--go-live)

---

## EXECUTIVE SUMMARY

### O Que Vamos Construir

**Fase 5: Hot Lead Conversion System** - Um funil de conversão inteligente que transforma "leads mornos" capturados na Fase 4 em "leads quentes" prontos para venda, através de:

- **Multi-step engagement portal** (5 etapas interativas)
- **Hybrid lead scoring** (heuristic + ML feedback loop)
- **WhatsApp Business API** integração nativa
- **Admin dashboard** com analytics detalhado
- **Automated nurture sequences** baseadas em comportamento

### Modelo Escolhido: B+C (Interactive + Enterprise)

```
SPRINT 3 (Fixes Críticos)        SPRINT 4 (Fase 5 MVP)      SPRINT 5+ (Enterprise Features)
├── 3.3 Remove mock              ├── 5.1 Phase5 Component   ├── Calendly real
├── 3.4 PDF download             ├── 5.2 Lead scoring       ├── Intercom chat
├── 3.5 OpenAI fallback          ├── 5.3 WhatsApp Business  ├── ML scoring
├── 3.6 Tradução                 ├── 5.4 Email sequences    ├── CRM integrations
└── Deploy & Test                ├── 5.5 Admin dashboard    └── Advanced analytics
                                 └── Deploy & Test
```

### Timeline Estimado

| Sprint | Tarefas | Esforço | Data Estimada |
|--------|---------|---------|---------------|
| **Sprint 3** | Fixes 3.3-3.6 | 13-18h | 2026-02-15 |
| **Sprint 4** | Fase 5 MVP (5.1-5.5) | 18-24h | 2026-02-28 |
| **Sprint 5** | Enterprise features | 16-20h | 2026-03-15 |

### Key Metrics Esperados

```
ANTES (Atual - Fase 4 Final)
├── Leads captured: 100%
├── Leads que voltam: ~5% (só que recebem email 1x)
├── Lead scoring: Heuristic simples (50-100 flat)
└── Conversão total: ~8-12%

DEPOIS (Com Fase 5 MVP)
├── Leads que entram Fase 5: 80%
├── Leads que completam sequência: 45-50%
├── Lead score refinado: 50-100 (dinâmico)
├── Leads "quentes" para vendas: 35-45%
└── Conversão total esperada: 25-30%

DEPOIS (Com Enterprise Features)
├── Leads com múltiplas touchpoints: 90%+
├── Lead score ML-based: Accuracy 85%+
├── Dashboard admin: Real-time pipeline
└── Conversão total: 40-50%+
```

---

## MODELO ARQUITETÔNICO ESCOLHIDO

### B+C: Interactive Phase 5 + Enterprise Features (Gradual)

#### Sprint 4: MODELO B (Interactive Multi-Step)

```
FASE 5 - Step by Step Engagement Portal

┌─────────────────────────────────────────────────────────────┐
│                   LEAD ENTERS FASE 5                        │
│         (Automatic after Phase 4 completion)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ STEP 1: "Você achou a solução interessante?"               │
│ ┌──────────────────────────────────────────────┐           │
│ │ O que achou do blueprint?                    │           │
│ │                                               │           │
│ │ ⭐ [Muito interessado - 100 pontos]          │           │
│ │ ⭐ [Interessado - 70 pontos]                 │           │
│ │ ⭐ [Talvez depois - 40 pontos]               │           │
│ │ ⭐ [Não é agora - 20 pontos]                 │           │
│ │                                               │           │
│ │ [Continuar →]                               │           │
│ └──────────────────────────────────────────────┘           │
│                                                             │
│ STEP 2: "Qual é seu orçamento?"                            │
│ ┌──────────────────────────────────────────────┐           │
│ │ A qual faixa seu projeto se aproxima?        │           │
│ │                                               │           │
│ │ ○ Até R$ 30k (+10 pontos)                    │           │
│ │ ○ R$ 30k - 60k (+20 pontos)                  │           │
│ │ ○ R$ 60k - 120k (+30 pontos)                 │           │
│ │ ○ +R$ 120k (+40 pontos)                      │           │
│ │                                               │           │
│ │ [Continuar →]                               │           │
│ └──────────────────────────────────────────────┘           │
│                                                             │
│ STEP 3: "Qual seu prazo?"                                  │
│ ┌──────────────────────────────────────────────┐           │
│ │ Quando você gostaria de começar?             │           │
│ │                                               │           │
│ │ ○ Urgente (< 2 semanas) (+30 pontos)        │           │
│ │ ○ Próximo mês (+20 pontos)                   │           │
│ │ ○ Próximos 3 meses (+10 pontos)              │           │
│ │ ○ Futuro (+5 pontos)                         │           │
│ │                                               │           │
│ │ [Continuar →]                               │           │
│ └──────────────────────────────────────────────┘           │
│                                                             │
│ STEP 4: "Vamos agendar uma discussão?"                     │
│ ┌──────────────────────────────────────────────┐           │
│ │ Selecione um dia/hora para conversar         │           │
│ │                                               │           │
│ │ [Calendar Widget - Calendly ou fake]        │           │
│ │                                               │           │
│ │ Horários disponíveis: [09:00] [14:00] [16:00]│           │
│ │ (Mock - futura integração com Calendly)      │           │
│ │                                               │           │
│ │ [Agendar →] (+30 pontos)                    │           │
│ └──────────────────────────────────────────────┘           │
│                                                             │
│ STEP 5: "Vamos conectar no WhatsApp?"                      │
│ ┌──────────────────────────────────────────────┐           │
│ │ Qual seu WhatsApp? (com +55)                 │           │
│ │ ┌──────────────────────────────────────────┐ │           │
│ │ │ +55 [__] [_____-____]                    │ │           │
│ │ └──────────────────────────────────────────┘ │           │
│ │                                               │           │
│ │ [✓] Adicione-me ao grupo de projeto        │           │
│ │ [✓] Receba updates por WhatsApp             │           │
│ │                                               │           │
│ │ [Conectar & Finalizar →] (+10 pontos)       │           │
│ └──────────────────────────────────────────────┘           │
│                                                             │
│ RESULTADO FINAL:                                            │
│ • Lead Score: 100-280 pontos → normalizado 50-100         │
│ • Lead Status: "quente" se score >= 70                     │
│ • Lead Status: "acompanhando" se score 50-69               │
│ • Trigger: Email com próximos passos                       │
│ • Trigger: WhatsApp Business invite (se número capturo)   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Sprint 5+: Evoluir para MODELO C (Enterprise)

```
Adicionar incrementalmente:
├── 📊 Analytics dashboard detalhado
├── 📧 Automated email nurture sequences
├── 💬 Live chat (Intercom)
├── 📅 Calendly real integration
├── 🤖 ML-based lead scoring
├── 📱 WhatsApp Business API webhooks
└── 🔗 CRM adapter pattern (HubSpot, Pipedrive)
```

---

## STORIES CRÍTICOS SPRINT 3 (Fixes)

### 🔴 Story 3.3: REMOVER MOCK BLUEPRINT

**Objetivo:** Eliminar geração de blueprint fake quando Gemini falha

**Problema Atual:**
```typescript
// src/lib/ai/blueprint.ts:68-98
const generateFallbackBlueprint = (input: BlueprintInput): Blueprint => {
  return {
    objectives: ['Otimizacao de Processos', 'Reducao de Custos', 'Automacao'],
    timeline: '30 dias',
    // ... SEMPRE OS MESMOS DADOS
  };
};
```

**Solução:**

1. **Remover função `generateFallbackBlueprint` completamente**
   - [ ] Delete em `src/lib/ai/blueprint.ts`
   - [ ] Atualizar imports em `src/components/phases/Phase4.tsx`

2. **Implementar error handling real:**
   ```typescript
   // src/lib/ai/blueprint.ts
   export async function generateBlueprint(input: BlueprintInput): Promise<Blueprint | null> {
     try {
       const blueprint = await callGemini(input);
       return blueprint;
     } catch (error) {
       logger.error('Blueprint generation failed', { error, input });
       // NÃO retorna fallback fake
       // Deixa erro subir pro componente
       throw error;
     }
   }
   ```

3. **UI Error Handling em Phase4:**
   ```typescript
   // src/components/phases/Phase4.tsx
   const [blueprintError, setBlueprintError] = useState<string | null>(null);

   const handleGenerateBlueprint = async () => {
     try {
       const blueprint = await generateBlueprint(input);
       setBlueprint(blueprint);
     } catch (error) {
       setBlueprintError(
         'Desculpe, não conseguimos gerar seu blueprint agora. ' +
         'Isso pode ser um problema temporário. Tente novamente em alguns minutos.'
       );
       // Log para Sentry
       captureException(error);
     }
   };

   if (blueprintError) {
     return (
       <ErrorCard>
         <p>{blueprintError}</p>
         <Button onClick={() => handleGenerateBlueprint()}>
           🔄 Tentar Novamente
         </Button>
       </ErrorCard>
     );
   }
   ```

4. **Fallback para OpenAI (via Story 3.5):**
   - Quando Gemini falha → tenta OpenAI automaticamente
   - Mesmo formato de resposta para ambos
   - Logging de qual provider funcionou

**Aceitação Criteria:**
- [ ] Função `generateFallbackBlueprint` removida
- [ ] Erro é exibido claramente ao usuário
- [ ] Botão "Tentar Novamente" funciona
- [ ] Erro logged em Sentry com contexto
- [ ] Fallback OpenAI testa automaticamente (3.5)
- [ ] Teste: Simular falha Gemini, verificar UX
- [ ] Teste: Retry funciona e gera blueprint real

**Estimativa:** 2-3h | **Prioridade:** 🔴 CRÍTICA

---

### 🔴 Story 3.4: PDF DOWNLOAD - BLUEPRINT TÉCNICO

**Objetivo:** Permitir download do blueprint como PDF

**Requisito PRD:** "Usuário pode fazer download do blueprint como PDF"

**Solução:**

1. **Instalar bibliotecas:**
   ```bash
   npm install jspdf html2canvas
   npm install -D @types/jspdf
   ```

2. **Criar `src/lib/pdf/blueprintGenerator.ts`:**
   ```typescript
   import jsPDF from 'jspdf';
   import html2canvas from 'html2canvas';

   export async function downloadBlueprintPDF(
     blueprint: Blueprint,
     problemStatement: string,
     filename?: string
   ): Promise<void> {
     try {
       // Opção 1: Renderizar component React → canvas → PDF
       const element = document.getElementById('blueprint-content');
       if (!element) throw new Error('Blueprint content not found');

       const canvas = await html2canvas(element, {
         scale: 2,
         useCORS: true,
         logging: false
       });

       const pdf = new jsPDF({
         orientation: 'portrait',
         unit: 'mm',
         format: 'a4'
       });

       const imgData = canvas.toDataURL('image/png');
       const pdfWidth = pdf.internal.pageSize.getWidth();
       const pdfHeight = pdf.internal.pageSize.getHeight();
       const imgHeight = (canvas.height * pdfWidth) / canvas.width;

       let heightLeft = imgHeight;
       let position = 0;

       // Multi-page handling
       while (heightLeft >= 0) {
         pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
         heightLeft -= pdfHeight;
         position -= pdfHeight;
         if (heightLeft >= 0) {
           pdf.addPage();
         }
       }

       // Download
       const finalFilename = filename || `blueprint-${Date.now()}.pdf`;
       pdf.save(finalFilename);

       // Track event
       trackEvent('blueprint_pdf_downloaded', {
         blueprintTitle: blueprint.title,
         filesize: pdf.output('arraybuffer').byteLength
       });

     } catch (error) {
       console.error('PDF generation failed:', error);
       toast.error('Falha ao gerar PDF. Tente novamente.');
       captureException(error);
     }
   }
   ```

3. **Componente `src/components/pdf/BlueprintPDF.tsx`:**
   ```typescript
   // Componente que renderiza o blueprint para PDF
   // Tem estilos especiais para print (media queries)
   export const BlueprintPDF: React.FC<BlueprintPDFProps> = ({ blueprint }) => {
     return (
       <div id="blueprint-content" className="blueprint-pdf-container">
         <div className="pdf-page">
           <h1 className="pdf-title">{blueprint.title}</h1>
           <p className="pdf-date">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>

           <section>
             <h2>Problema</h2>
             <p>{blueprint.problemStatement}</p>
           </section>

           <section>
             <h2>Objetivos</h2>
             <ul>
               {blueprint.objectives.map((obj, i) => (
                 <li key={i}>{obj}</li>
               ))}
             </ul>
           </section>

           {/* ... mais seções ... */}
         </div>
       </div>
     );
   };
   ```

4. **Integrar em Phase4:**
   ```typescript
   // src/components/phases/Phase4.tsx
   import { downloadBlueprintPDF } from '@/lib/pdf/blueprintGenerator';

   <Button
     onClick={() => downloadBlueprintPDF(blueprint, problemStatement)}
     icon="📥"
     variant="secondary"
   >
     Baixar Blueprint (PDF)
   </Button>
   ```

5. **Email com PDF (Future - integração com 3.1):**
   ```typescript
   // Futura integração com supabase/functions/send-email
   // Permitir attachment do PDF gerado
   await sendEmailWithAttachment({
     to: lead.email,
     template: 'blueprintDelivery',
     attachment: {
       filename: `blueprint-${blueprint.id}.pdf`,
       content: pdfBuffer
     }
   });
   ```

**Aceitação Criteria:**
- [ ] PDF gerado sem erros
- [ ] Blueprint completo em PDF (todas as seções)
- [ ] Download funciona em Chrome, Firefox, Safari
- [ ] Estilos print otimizados (sem elementos desnecessários)
- [ ] Teste: Gerar PDF com blueprint grande (verificar paginação)
- [ ] Teste: Download múltiplos PDFs (sem conflitos)
- [ ] Event tracking: `blueprint_pdf_downloaded` logger em GA4

**Estimativa:** 3-4h | **Prioridade:** 🔴 CRÍTICA

---

### 🟡 Story 3.5: OPENAI FALLBACK - PROVIDER ABSTRACTION

**Objetivo:** Implementar abstração de AI providers com fallback Gemini → OpenAI

**Problema Atual:**
- Só Gemini funciona (hardcoded)
- Falha do Gemini = falha da app
- Sem retry logic
- Sem fallback real

**Solução:**

1. **Criar abstração de providers em `src/lib/ai/providers/`:**

   ```typescript
   // src/lib/ai/providers/types.ts
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
     complexity: string;
     processedText: string;
     keywords: string[];
     embedding: number[];
   }

   export interface QuestionsResponse {
     questions: AdaptiveQuestion[];
   }

   export interface BlueprintResponse {
     title: string;
     executiveSummary: string;
     // ... blueprint fields
   }
   ```

   ```typescript
   // src/lib/ai/providers/index.ts
   export type AIConfig = {
     primaryProvider: AIProvider;
     fallbackProvider: AIProvider;
     retryAttempts: number;
     retryDelayMs: number;
     timeout: number;
   };

   const DEFAULT_CONFIG: AIConfig = {
     primaryProvider: 'gemini',
     fallbackProvider: 'openai',
     retryAttempts: 2,
     retryDelayMs: 1000,
     timeout: 30000
   };

   export async function callAIWithFallback<T>(
     operation: (provider: AIProvider) => Promise<T>,
     config: AIConfig = DEFAULT_CONFIG
   ): Promise<T> {
     // Try primary provider with retries
     for (let attempt = 0; attempt < config.retryAttempts; attempt++) {
       try {
         logger.info(`Attempting ${config.primaryProvider}`, { attempt });
         const result = await withTimeout(
           operation(config.primaryProvider),
           config.timeout
         );
         logger.info(`${config.primaryProvider} succeeded`);
         return result;
       } catch (error) {
         logger.warn(`${config.primaryProvider} attempt ${attempt} failed`, { error });
         if (attempt < config.retryAttempts - 1) {
           await delay(config.retryDelayMs);
         }
       }
     }

     // Fallback to secondary provider
     try {
       logger.info(`Falling back to ${config.fallbackProvider}`);
       const result = await withTimeout(
         operation(config.fallbackProvider),
         config.timeout
       );
       logger.info(`${config.fallbackProvider} succeeded`);
       return result;
     } catch (error) {
       logger.error(`Both providers failed`, { error });
       throw new AIProviderError(
         `All AI providers failed. Last error: ${error.message}`
       );
     }
   }
   ```

2. **Implementar Gemini provider:**

   ```typescript
   // src/lib/ai/providers/gemini.ts
   import { GoogleGenerativeAI } from '@google/generai';

   const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

   export async function analyzeWithGemini(
     problemText: string
   ): Promise<AnalysisResponse> {
     const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

     const prompt = `...`; // Existing prompt

     const response = await model.generateContent({
       contents: [{ role: 'user', parts: [{ text: prompt }] }],
       generationConfig: {
         responseSchema: {
           type: 'OBJECT',
           properties: {
             domain: { type: 'STRING' },
             persona: { type: 'STRING' },
             intentScore: { type: 'NUMBER' },
             // ... outros campos
           }
         },
         responseMimeType: 'application/json'
       }
     });

     return JSON.parse(response.text());
   }

   export async function generateQuestionsWithGemini(
     problemText: string,
     intentScore: number
   ): Promise<QuestionsResponse> {
     // Similar implementation
   }

   export async function generateBlueprintWithGemini(
     input: BlueprintInput
   ): Promise<BlueprintResponse> {
     // Similar implementation
   }

   export async function generateEmbedding(
     text: string
   ): Promise<number[]> {
     const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
     const result = await model.embedContent(text);
     return result.embedding.values;
   }
   ```

3. **Implementar OpenAI provider:**

   ```typescript
   // src/lib/ai/providers/openai.ts
   import OpenAI from 'openai';

   const openai = new OpenAI({
     apiKey: import.meta.env.VITE_OPENAI_API_KEY
   });

   export async function analyzeWithOpenAI(
     problemText: string
   ): Promise<AnalysisResponse> {
     const response = await openai.chat.completions.create({
       model: 'gpt-4-turbo',
       messages: [
         {
           role: 'system',
           content: 'You are an expert business consultant...'
         },
         {
           role: 'user',
           content: `Analyze this problem: ${problemText}`
         }
       ],
       response_format: {
         type: 'json_schema',
         json_schema: {
           name: 'analysis',
           properties: {
             domain: { type: 'string' },
             persona: { type: 'string' },
             // ... outros campos
           }
         }
       }
     });

     const content = response.choices[0].message.content;
     return JSON.parse(content);
   }

   // Similar for generateQuestionsWithOpenAI, generateBlueprintWithOpenAI

   export async function generateEmbedding(text: string): Promise<number[]> {
     const response = await openai.embeddings.create({
       model: 'text-embedding-3-small',
       input: text
     });
     return response.data[0].embedding;
   }
   ```

4. **Refatorar chamadas em componentes:**

   ```typescript
   // src/lib/ai/api.ts (refatorado)
   import { callAIWithFallback } from './providers';

   export async function analyzeProblem(text: string): Promise<AnalysisResponse> {
     return callAIWithFallback(async (provider) => {
       if (provider === 'gemini') {
         return analyzeWithGemini(text);
       } else {
         return analyzeWithOpenAI(text);
       }
     });
   }

   export async function generateAdaptiveQuestions(
     problemText: string,
     intentScore: number
   ): Promise<QuestionsResponse> {
     return callAIWithFallback(async (provider) => {
       if (provider === 'gemini') {
         return generateQuestionsWithGemini(problemText, intentScore);
       } else {
         return generateQuestionsWithOpenAI(problemText, intentScore);
       }
     });
   }

   export async function generateTechnicalBlueprint(
     input: BlueprintInput
   ): Promise<BlueprintResponse> {
     return callAIWithFallback(async (provider) => {
       if (provider === 'gemini') {
         return generateBlueprintWithGemini(input);
       } else {
         return generateBlueprintWithOpenAI(input);
       }
     });
   }
   ```

5. **Configurar environment variables:**

   ```env
   # .env.local (desenvolvimento)
   VITE_GEMINI_API_KEY=xxxxx
   VITE_OPENAI_API_KEY=sk-xxxxx
   VITE_PRIMARY_AI_PROVIDER=gemini
   VITE_FALLBACK_AI_PROVIDER=openai
   VITE_AI_RETRY_ATTEMPTS=2
   VITE_AI_TIMEOUT_MS=30000
   ```

**Aceitação Criteria:**
- [ ] Gemini funciona como primary
- [ ] OpenAI é chamado se Gemini falha
- [ ] Mesmo formato de resposta para ambos
- [ ] Retry logic com backoff (2 tentativas padrão)
- [ ] Logging: qual provider foi usado
- [ ] Teste: Simular falha Gemini, verificar fallback OpenAI
- [ ] Teste: Respostas consistentes de ambos providers
- [ ] Teste: Timeout tratado corretamente

**Estimativa:** 4-5h | **Prioridade:** 🔴 CRÍTICA

---

### 🟡 Story 3.6: TRADUÇÃO COMPLETA - PT-BR/EN

**Objetivo:** Eliminar strings hardcoded, usar i18n para todo texto

**Escopo:**

1. **Revisar todos os arquivos de componentes:**
   - [ ] `src/components/phases/Phase*.tsx`
   - [ ] `src/components/LandingPage.tsx`
   - [ ] `src/components/LanguageSelector.tsx`
   - [ ] `src/components/ui/*.tsx`
   - [ ] `src/contexts/AuthContext.tsx`

2. **Adicionar chaves de tradução:**

   ```typescript
   // src/i18n/locales/pt-BR.json
   {
     "phases": {
       "phase1": {
         "title": "Descreva Seu Problema",
         "subtitle": "Quanto mais específico, melhor entenderemos sua situação",
         "inputPlaceholder": "Digite aqui seu problema...",
         "guides": {
           "guide1": "Qual é o maior desafio operacional?",
           "guide2": "Quais processos consomem mais tempo?",
           // ... 10 mais
         }
       },
       "phase2": {
         "title": "Selecionaremos as Dimensões",
         "frequency": "Frequência",
         // ...
       },
       "phase3": {
         "title": "Perguntas Adaptativas",
         "question": "Pergunta {{number}} de {{total}}",
         // ...
       },
       "phase4": {
         "title": "Seu Blueprint Técnico",
         "downloadPDF": "Baixar Blueprint (PDF)",
         "leadFormTitle": "Capture seu Blueprint",
         // ...
       }
     },
     "auth": {
       "signIn": "Entrar",
       "signOut": "Sair",
       "googleAuth": "Continuar com Google",
       "magicLink": "Receber Link Mágico",
       // ...
     },
     "common": {
       "loading": "Carregando...",
       "error": "Ocorreu um erro",
       "retry": "Tentar Novamente",
       "close": "Fechar",
       // ...
     }
   }
   ```

3. **Substituir hardcoded strings:**

   ```typescript
   // ANTES
   const THINKING_GUIDES = {
     PT: [
       'Qual é o maior desafio operacional?',
       'Quais processos consomem mais tempo?',
       // ...
     ]
   };

   // DEPOIS
   const guides = t('phases.phase1.guides');
   // Ou listar como array de chaves
   ```

4. **Variáveis de ambiente para valores dinâmicos:**

   ```env
   VITE_WHATSAPP_PHONE=+5511999999999
   VITE_COMPANY_EMAIL=contato@allmaxmind.com
   VITE_SUPPORT_URL=https://support.allmaxmind.com
   ```

5. **Atualizar WhatsApp number em componentes:**

   ```typescript
   // ANTES
   const whatsappLink = `https://wa.me/5511999999999?text=...`;

   // DEPOIS
   const whatsappLink = `https://wa.me/${import.meta.env.VITE_WHATSAPP_PHONE}?text=...`;
   ```

**Aceitação Criteria:**
- [ ] Nenhuma string hardcoded em componentes
- [ ] Todas as chaves existem em pt-BR.json e en.json
- [ ] Tradução de qualidade (não Google Translate)
- [ ] Interpolação funciona (ex: {{count}} items)
- [ ] Language selector funciona
- [ ] Teste: Trocar idioma em cada página
- [ ] Teste: WhatsApp phone via env var

**Estimativa:** 2-3h | **Prioridade:** 🟡 ALTA

---

## STORIES FASE 5 SPRINT 4

### 📋 Story 5.1: PHASE 5 COMPONENT - INTERACTIVE MULTI-STEP

**Objetivo:** Implementar componente Phase5 com 5 passos de engajamento

**Database Changes:**

```sql
-- Adicionar campos na tabela leads para Fase 5
ALTER TABLE leads ADD COLUMN (
  feedback_score NUMERIC,              -- Step 1: 20-100
  budget_range VARCHAR(50),            -- Step 2: até_30k, 30_60k, 60_120k, 120k_plus
  project_timeline_estimated INT,      -- Step 3: dias (7, 30, 90, 180)
  prototype_commitment BOOLEAN,         -- Step 4: User confirmou
  scheduled_call TIMESTAMP,             -- Step 4: Data/hora do call
  whatsapp_phone VARCHAR(20),           -- Step 5: +55 11 99999-9999
  whatsapp_added BOOLEAN DEFAULT FALSE, -- Step 5: Adicionado ao grupo
  phase5_started_at TIMESTAMP,
  phase5_completed_at TIMESTAMP,
  engagement_score NUMERIC DEFAULT 0    -- 0-100, calculado ao final
);

-- Tabela de tracking de interações (futura - Sprint 5)
CREATE TABLE lead_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50),        -- step1, step2, step3, step4, step5, pdf_download
  step_number INT,
  data JSONB,                          -- Dados específicos da interação
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lead_interactions_lead_id ON lead_interactions(lead_id);
CREATE INDEX idx_lead_interactions_type ON lead_interactions(interaction_type);
```

**Componente React:**

```typescript
// src/components/phases/Phase5.tsx
import React, { useState } from 'react';
import { useTranslation } from 'i18next';
import { Step1_Feedback } from './steps/Step1_Feedback';
import { Step2_Budget } from './steps/Step2_Budget';
import { Step3_Timeline } from './steps/Step3_Timeline';
import { Step4_Schedule } from './steps/Step4_Schedule';
import { Step5_WhatsApp } from './steps/Step5_WhatsApp';

export interface Phase5Props {
  leadId: string;
  leadData: Lead;
  problemStatement: string;
  onComplete: () => void;
}

export const Phase5: React.FC<Phase5Props> = ({
  leadId,
  leadData,
  problemStatement,
  onComplete
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State para cada step
  const [formData, setFormData] = useState({
    feedbackScore: 0,
    budgetRange: '',
    projectTimeline: 0,
    scheduleDate: null as Date | null,
    whatsappPhone: ''
  });

  const handleStepComplete = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Save current step data
      await saveStepData(leadId, currentStep, formData);

      // Special handling for last step
      if (currentStep === 5) {
        await saveFinalPhase5Data(leadId, formData);
        onComplete();
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (err) {
      setError((err as Error).message);
      captureException(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render steps
  const renderStep = () => {
    const commonProps = {
      isLoading,
      onNext: handleStepComplete,
      onBack: currentStep > 1 ? handleStepBack : undefined
    };

    switch (currentStep) {
      case 1:
        return (
          <Step1_Feedback
            {...commonProps}
            score={formData.feedbackScore}
            onScoreChange={(score) =>
              setFormData({ ...formData, feedbackScore: score })
            }
          />
        );
      case 2:
        return (
          <Step2_Budget
            {...commonProps}
            budget={formData.budgetRange}
            onBudgetChange={(budget) =>
              setFormData({ ...formData, budgetRange: budget })
            }
          />
        );
      case 3:
        return (
          <Step3_Timeline
            {...commonProps}
            timeline={formData.projectTimeline}
            onTimelineChange={(timeline) =>
              setFormData({ ...formData, projectTimeline: timeline })
            }
          />
        );
      case 4:
        return (
          <Step4_Schedule
            {...commonProps}
            date={formData.scheduleDate}
            onDateChange={(date) =>
              setFormData({ ...formData, scheduleDate: date })
            }
          />
        );
      case 5:
        return (
          <Step5_WhatsApp
            {...commonProps}
            phone={formData.whatsappPhone}
            onPhoneChange={(phone) =>
              setFormData({ ...formData, whatsappPhone: phone })
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="phase5-container">
      {/* Progress indicator */}
      <div className="phase5-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
        <p className="progress-text">
          {t('phase5.step', { current: currentStep, total: 5 })}
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="error-card">
          <p>{error}</p>
          <button onClick={() => setError(null)}>{t('common.close')}</button>
        </div>
      )}

      {/* Step content */}
      <div className="phase5-step">{renderStep()}</div>
    </div>
  );
};

// Step components...
```

**Step 1: Feedback**

```typescript
// src/components/phases/steps/Step1_Feedback.tsx
export const Step1_Feedback: React.FC<Step1Props> = ({
  score,
  onScoreChange,
  onNext,
  isLoading
}) => {
  const { t } = useTranslation();

  const options = [
    { value: 100, label: t('phase5.step1.veryInterested'), emoji: '🔥' },
    { value: 70, label: t('phase5.step1.interested'), emoji: '👍' },
    { value: 40, label: t('phase5.step1.maybe'), emoji: '🤔' },
    { value: 20, label: t('phase5.step1.notNow'), emoji: '⏰' }
  ];

  return (
    <div className="step-card">
      <h2>{t('phase5.step1.title')}</h2>
      <p>{t('phase5.step1.description')}</p>

      <div className="option-grid">
        {options.map((option) => (
          <button
            key={option.value}
            className={`option-button ${score === option.value ? 'selected' : ''}`}
            onClick={() => onScoreChange(option.value)}
          >
            <span className="emoji">{option.emoji}</span>
            <span className="label">{option.label}</span>
          </button>
        ))}
      </div>

      <button onClick={onNext} disabled={score === 0 || isLoading}>
        {t('common.continue')} →
      </button>
    </div>
  );
};
```

**Step 2: Budget**

```typescript
// src/components/phases/steps/Step2_Budget.tsx
export const Step2_Budget: React.FC<Step2Props> = ({
  budget,
  onBudgetChange,
  onNext,
  onBack,
  isLoading
}) => {
  const { t } = useTranslation();

  const budgetOptions = [
    { value: 'ate_30k', label: 'Até R$ 30k', points: 10 },
    { value: '30_60k', label: 'R$ 30k - 60k', points: 20 },
    { value: '60_120k', label: 'R$ 60k - 120k', points: 30 },
    { value: 'acima_120k', label: '+ R$ 120k', points: 40 }
  ];

  return (
    <div className="step-card">
      <h2>{t('phase5.step2.title')}</h2>
      <p>{t('phase5.step2.description')}</p>

      <div className="budget-options">
        {budgetOptions.map((option) => (
          <label key={option.value} className="radio-option">
            <input
              type="radio"
              name="budget"
              value={option.value}
              checked={budget === option.value}
              onChange={(e) => onBudgetChange(e.target.value)}
            />
            <span className="option-text">
              {option.label}
              <span className="points">+{option.points} pontos</span>
            </span>
          </label>
        ))}
      </div>

      <div className="button-group">
        <button onClick={onBack}> ← {t('common.back')}</button>
        <button onClick={onNext} disabled={!budget || isLoading}>
          {t('common.continue')} →
        </button>
      </div>
    </div>
  );
};
```

**Aceitação Criteria:**
- [ ] Todos 5 steps implementados e funcionais
- [ ] Navegação entre steps funciona (forward/back)
- [ ] Dados salvos em DB após cada step
- [ ] Loading states mostrados
- [ ] Error handling com retry
- [ ] i18n funciona em todos os steps
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Teste: Complete todos 5 steps
- [ ] Teste: Voltar e editar dados
- [ ] Evento tracked em GA4 para cada step

**Estimativa:** 6-8h | **Prioridade:** 🔴 CRÍTICA

---

### 📋 Story 5.2: LEAD SCORING SYSTEM - HYBRID

**Objetivo:** Implementar lead scoring dinâmico (heuristic + feedback loop)

**Arquitetura:**

```
SCORE COMPOSITION:

Initial Score (heuristic - Fase 4)
├── Corporate email: +10
├── Senior job title: +15
├── Company provided: +10
└── Base: 50
→ Resultado: 50-85 pontos

Phase 5 Refinement (dynamic - Fase 5)
├── Step 1 (Feedback): +20 a +100 (substituí base)
├── Step 2 (Budget): +10 a +40
├── Step 3 (Timeline): +5 a +30
├── Step 4 (Call agendado): +30 extra
├── Step 5 (WhatsApp): +10 extra
└── Resultado: 75-280 pontos

Normalization & Actions
├── Score 75-100: "quente" 🔥 → Assign to sales
├── Score 50-74: "acompanhando" → Nurture sequence
└── Score < 50: "morno" ❄️ → Re-engage sequence

FUTURE (Sprint 5+) - ML Feedback Loop:
├── Track lead interactions (PDF download, email open, etc)
├── Adjust score based on behavior
├── Retrain model monthly
└── Accuracy target: 85%+
```

**Implementação:**

```typescript
// src/lib/leads/scorer.ts
export interface LeadScoringInput {
  // Fase 4 heuristics
  emailDomain?: string;           // corporativo vs gmail
  jobTitle?: string;              // seniority level
  companySize?: number;           // número de funcionários

  // Fase 5 inputs
  feedbackScore?: number;         // 20-100
  budgetRange?: string;           // categoria orçamento
  timeline?: number;              // dias
  callScheduled?: boolean;        // true/false
  whatsappAdded?: boolean;        // true/false

  // Future ML inputs
  interactions?: LeadInteraction[];
}

export class LeadScorer {
  // Heuristic scoring (Fase 4)
  static calculateInitialScore(input: Omit<LeadScoringInput, 'feedbackScore' | 'budgetRange' | 'timeline' | 'callScheduled' | 'whatsappAdded'>): number {
    let score = 50; // Base

    if (input.emailDomain) {
      const isCorporateEmail = !['gmail.com', 'yahoo.com', 'hotmail.com'].includes(input.emailDomain);
      if (isCorporateEmail) score += 10;
    }

    if (input.jobTitle) {
      const seniorTitles = ['ceo', 'director', 'gerente', 'manager', 'vp', 'vice', 'head'];
      const isSenior = seniorTitles.some(title => input.jobTitle.toLowerCase().includes(title));
      if (isSenior) score += 15;
    }

    if (input.companySize && input.companySize > 50) {
      score += 10;
    }

    return Math.min(score, 85); // Cap at 85 before Phase 5
  }

  // Dynamic scoring (Fase 5)
  static calculateDynamicScore(input: LeadScoringInput): number {
    let score = 0;

    // Phase 5 inputs override initial
    if (input.feedbackScore) {
      score = input.feedbackScore; // Replace, not add
    }

    if (input.budgetRange) {
      const budgetPoints = {
        'ate_30k': 10,
        '30_60k': 20,
        '60_120k': 30,
        'acima_120k': 40
      };
      score += budgetPoints[input.budgetRange] || 0;
    }

    if (input.timeline) {
      if (input.timeline < 14) score += 30;         // Urgente
      else if (input.timeline < 60) score += 20;    // Próximas semanas
      else if (input.timeline < 120) score += 10;   // Próximos meses
      else score += 5;                              // Futuro
    }

    if (input.callScheduled) {
      score += 30;
    }

    if (input.whatsappAdded) {
      score += 10;
    }

    return Math.min(score, 100); // Normalize to 0-100
  }

  // Lead status determination
  static getLeadStatus(score: number): LeadStatus {
    if (score >= 75) return 'quente';
    if (score >= 50) return 'acompanhando';
    return 'morno';
  }

  // Future ML scoring (Sprint 5)
  static calculateMLScore(input: LeadScoringInput): Promise<number> {
    // TODO: Call ML endpoint
    // Placeholder for now
    return Promise.resolve(this.calculateDynamicScore(input));
  }
}

// Usar em Phase4 e Phase5:
export async function updateLeadScore(
  leadId: string,
  input: LeadScoringInput
): Promise<{ score: number; status: LeadStatus }> {
  const score = LeadScorer.calculateDynamicScore(input);
  const status = LeadScorer.getLeadStatus(score);

  // Atualizar DB
  const { error } = await supabase
    .from('leads')
    .update({
      engagement_score: score,
      lead_status: status,
      updated_at: new Date()
    })
    .eq('id', leadId);

  if (error) throw error;

  // Track event
  trackEvent('lead_score_updated', {
    leadId,
    newScore: score,
    newStatus: status,
    inputs: input
  });

  return { score, status };
}
```

**Integração em Phase5:**

```typescript
// src/components/phases/Phase5.tsx
const handleStepComplete = async () => {
  try {
    setIsLoading(true);

    // Salvar step data
    await saveStepData(leadId, currentStep, formData);

    // Recalcular score após cada step
    const { score, status } = await updateLeadScore(leadId, {
      feedbackScore: formData.feedbackScore,
      budgetRange: formData.budgetRange,
      timeline: formData.projectTimeline,
      callScheduled: !!formData.scheduleDate,
      whatsappAdded: !!formData.whatsappPhone
    });

    // Mostrar novo score ao usuário
    setCurrentScore(score);
    setCurrentStatus(status);

    // Se quente, trigger ação (email, SMS, etc)
    if (status === 'quente' && previousStatus !== 'quente') {
      await triggerHotLeadSequence(leadId);
    }

    if (currentStep === 5) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  } catch (err) {
    setError((err as Error).message);
  } finally {
    setIsLoading(false);
  }
};
```

**Aceitação Criteria:**
- [ ] Score heuristic funciona em Fase 4
- [ ] Score dinâmico atualiza em cada step da Fase 5
- [ ] Status muda corretamente (morno → acompanhando → quente)
- [ ] Score normalizado 50-100 em UI
- [ ] Teste: Múltiplos cenários (high-score, low-score, etc)
- [ ] Logging de score changes em DB
- [ ] Event tracking em GA4

**Estimativa:** 2-3h | **Prioridade:** 🔴 CRÍTICA

---

### 📋 Story 5.3: WHATSAPP BUSINESS API INTEGRATION

**Objetivo:** Integrar WhatsApp Business API para comunicação com leads

**Arquitetura:**

```
USER INPUT (Step 5)
  ↓ Digite seu WhatsApp (+55 11 99999-9999)
  ↓
VALIDAÇÃO
  ├─ Formato +55 11 99999-9999
  ├─ Se Supabase tem VITE_WHATSAPP_GROUP_ID (necessário)
  └─ Se Supabase tem VITE_WHATSAPP_API_TOKEN (necessário)
  ↓
EDGE FUNCTION: add-to-whatsapp-group
  ├─ Input: { leadId, phone, leadName, companyName }
  ├─ Call WhatsApp Cloud API
  │  └─ POST /v18.0/{PHONE_NUMBER_ID}/messages
  │     {
  │       "messaging_product": "whatsapp",
  │       "recipient_type": "individual",
  │       "to": "+55 11 99999-9999",
  │       "type": "template",
  │       "template": {
  │         "name": "lead_welcome",
  │         "language": { "code": "pt_BR" }
  │       }
  │     }
  ├─ (Future) Adicionar ao grupo (requer Admin API)
  └─ Log response em Supabase
  ↓
BACKEND
  └─ Update leads.whatsapp_phone e whatsapp_added
  ↓
FRONTEND
  └─ Show success message & next steps
```

**Setup WhatsApp Cloud API:**

```
1. Criar Business Account em meta.com
2. Criar app WhatsApp (v18.0+)
3. Gerar access token (Business Accounts)
4. Guardar em Supabase Secrets:
   - WHATSAPP_PHONE_NUMBER_ID
   - WHATSAPP_BUSINESS_ACCOUNT_ID
   - WHATSAPP_API_TOKEN (access token com 24h expiry)
   - WHATSAPP_GROUP_ID (para futura integração)
```

**Implementação:**

```typescript
// supabase/functions/add-to-whatsapp-group/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const WHATSAPP_API_VERSION = "v18.0";
const WHATSAPP_BUSINESS_URL = `https://graph.instagram.com/${WHATSAPP_API_VERSION}`;

serve(async (req) => {
  try {
    // Validate request
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const { leadId, phone, leadName, companyName } = await req.json();

    if (!leadId || !phone) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Get API credentials from Supabase secrets
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const apiToken = Deno.env.get("WHATSAPP_API_TOKEN");

    if (!phoneNumberId || !apiToken) {
      console.error("Missing WhatsApp API credentials");
      return new Response("Server configuration error", { status: 500 });
    }

    // Validar formato do telefone
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone.startsWith("55") || cleanPhone.length < 12) {
      return new Response("Invalid phone format", { status: 400 });
    }

    // Step 1: Send welcome message via WhatsApp Cloud API
    const templatePayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanPhone,
      type: "template",
      template: {
        name: "lead_welcome",
        language: {
          code: "pt_BR"
        },
        parameters: {
          body: {
            parameters: [
              { type: "text", text: leadName || "Prospect" },
              { type: "text", text: companyName || "Your Company" }
            ]
          }
        }
      }
    };

    const sendMessageResponse = await fetch(
      `${WHATSAPP_BUSINESS_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(templatePayload)
      }
    );

    if (!sendMessageResponse.ok) {
      const error = await sendMessageResponse.text();
      console.error("WhatsApp API error:", error);
      throw new Error(`WhatsApp API failed: ${error}`);
    }

    const messageResult = await sendMessageResponse.json();
    const messageId = messageResult.messages?.[0]?.id;

    // Step 2: Update lead in Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    const { error: updateError } = await supabase
      .from("leads")
      .update({
        whatsapp_phone: cleanPhone,
        whatsapp_added: true,
        whatsapp_message_id: messageId,
        updated_at: new Date()
      })
      .eq("id", leadId);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    // Step 3: Log interaction
    await supabase
      .from("lead_interactions")
      .insert([
        {
          lead_id: leadId,
          interaction_type: "whatsapp_added",
          data: {
            phone: cleanPhone,
            messageId,
            timestamp: new Date()
          }
        }
      ]);

    return new Response(
      JSON.stringify({
        success: true,
        messageId,
        message: "Lead added to WhatsApp successfully"
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
```

**Frontend Component:**

```typescript
// src/components/phases/steps/Step5_WhatsApp.tsx
export const Step5_WhatsApp: React.FC<Step5Props> = ({
  phone,
  onPhoneChange,
  onNext,
  onBack,
  isLoading,
  leadId
}) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const validateAndFormatPhone = (input: string): string => {
    // Remove non-digits
    const cleaned = input.replace(/\D/g, "");

    // If doesn't start with 55, prepend it
    if (!cleaned.startsWith("55")) {
      return `55${cleaned}`;
    }

    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Allow only digits and specific chars for formatting
    value = value.replace(/[^\d\s\-\(\)]/g, "");

    // Format as user types
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 11) {
      // Format: (XX) XXXXX-XXXX
      if (cleaned.length <= 2) {
        value = cleaned;
      } else if (cleaned.length <= 7) {
        value = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
      } else {
        value = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
      }
    }

    onPhoneChange(value);
  };

  const handleSubmit = async () => {
    try {
      const formatted = validateAndFormatPhone(phone);

      if (!formatted.startsWith("55") || formatted.length < 12) {
        setError(t("phase5.step5.invalidPhone"));
        return;
      }

      setError(null);

      // Call edge function
      const response = await supabase.functions.invoke("add-to-whatsapp-group", {
        body: {
          leadId,
          phone: formatted,
          leadName: "User",  // Pass from context
          companyName: "Company"  // Pass from context
        }
      });

      if (!response.data.success) {
        setError(response.data.error || t("phase5.step5.whatsappError"));
        return;
      }

      // Success
      toast.success(t("phase5.step5.success"));
      onNext();
    } catch (err) {
      setError((err as Error).message);
      captureException(err);
    }
  };

  return (
    <div className="step-card">
      <h2>{t("phase5.step5.title")}</h2>
      <p>{t("phase5.step5.description")}</p>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="whatsapp">
          {t("phase5.step5.phoneLabel")}
        </label>
        <input
          id="whatsapp"
          type="tel"
          placeholder="+55 (11) 99999-9999"
          value={phone}
          onChange={handlePhoneChange}
          disabled={isLoading}
        />
      </div>

      <div className="checkbox-group">
        <label>
          <input type="checkbox" defaultChecked />
          {t("phase5.step5.addToGroup")}
        </label>
        <label>
          <input type="checkbox" defaultChecked />
          {t("phase5.step5.receiveUpdates")}
        </label>
      </div>

      <div className="button-group">
        <button onClick={onBack} disabled={isLoading}>
          ← {t("common.back")}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!phone || isLoading}
          className="primary"
        >
          {isLoading ? t("common.loading") : t("phase5.step5.submit")}
        </button>
      </div>
    </div>
  );
};
```

**Database Updates:**

```sql
ALTER TABLE leads ADD COLUMN (
  whatsapp_phone VARCHAR(20),
  whatsapp_added BOOLEAN DEFAULT FALSE,
  whatsapp_message_id VARCHAR(255),
  whatsapp_template_used VARCHAR(50)
);

-- WhatsApp templates table (future - para multi-template support)
CREATE TABLE whatsapp_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255) UNIQUE,
  template_name VARCHAR(255),  -- Nome no WhatsApp Cloud
  language VARCHAR(10),         -- pt_BR, en_US
  parameters JSONB,             -- Campo de parâmetros esperados
  created_at TIMESTAMP
);

-- Sample template data
INSERT INTO whatsapp_templates (name, template_name, language, parameters) VALUES
('lead_welcome', 'lead_welcome', 'pt_BR', '{"body": ["name", "company"]}'),
('blueprint_delivery', 'blueprint_delivery', 'pt_BR', '{"body": ["name", "blueprintTitle"]}'),
('call_reminder', 'call_reminder', 'pt_BR', '{"body": ["name", "dateTime"]}');
```

**Aceitação Criteria:**
- [ ] Phone input validado e formatado
- [ ] Edge function chama WhatsApp API com sucesso
- [ ] Message enviada via WhatsApp (verificar no app)
- [ ] Lead atualizado em DB com phone + flag
- [ ] Error handling se API falha
- [ ] Teste: Múltiplos telefones (diferentes formatos)
- [ ] Teste: API rate limiting (WhatsApp limits 1000 msg/dia)
- [ ] Log em lead_interactions table

**Estimativa:** 4-5h | **Prioridade:** 🔴 CRÍTICA

---

### 📋 Story 5.4: EMAIL SEQUENCES & AUTOMATION

**Objetivo:** Implementar email sequences automáticas baseadas em lead status e comportamento

**Sequências Planejadas:**

```
LEAD QUENTE (score >= 75)
├─ Email 1 (Imediato após Phase 5): "Obrigado + Próximos Passos"
├─ Email 2 (24h depois): "Veja como outros resolveram"
├─ Email 3 (48h depois): "Seu protótipo: Análise Técnica"
└─ Email 4 (Dia 3): "Agendar discussão com especialista"

LEAD ACOMPANHANDO (50-74)
├─ Email 1 (Imediato): "Muito interessante sua situação"
├─ Email 2 (3 dias): "Case study similar"
├─ Email 3 (7 dias): "Reduza custos com esta abordagem"
└─ Email 4 (14 dias): "Aproveitar 20% de desconto"

LEAD MORNO (<50)
├─ Email 1 (Imediato): "Aguardamos seu retorno"
├─ Email 2 (7 dias): "Seu blueprint está salvo"
├─ Email 3 (14 dias): "Novidades: Inteligência Artificial"
└─ Email 4 (30 dias): "Aproveitar oferta especial"
```

**Database Schema:**

```sql
CREATE TABLE email_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  status VARCHAR(50),           -- quente, acompanhando, morno
  current_email_number INT,     -- 1-4
  next_send_at TIMESTAMP,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);

CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  email_type VARCHAR(255),      -- phase4_confirmation, quente_1, etc
  template_name VARCHAR(255),
  recipient_email VARCHAR(255),
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced BOOLEAN DEFAULT FALSE,
  bounce_reason VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP
);

CREATE INDEX idx_email_sequences_lead_id ON email_sequences(lead_id);
CREATE INDEX idx_email_sequences_next_send ON email_sequences(next_send_at);
CREATE INDEX idx_email_logs_lead_id ON email_logs(lead_id);
```

**Email Sequence Orchestrator:**

```typescript
// src/lib/email/sequenceOrchestrator.ts
export type LeadStatus = 'quente' | 'acompanhando' | 'morno';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: (context: EmailContext) => string;
  htmlBody: (context: EmailContext) => string;
  delayMinutes: number;  // Delay from previous email
}

export interface EmailContext {
  leadName: string;
  leadEmail: string;
  companyName: string;
  blueprintTitle: string;
  problemStatement: string;
  leadScore: number;
  leadStatus: LeadStatus;
  caseStudyUrl?: string;
  scheduleUrl?: string;
}

const EMAIL_SEQUENCES: Record<LeadStatus, EmailTemplate[]> = {
  'quente': [
    {
      id: 'quente_1',
      name: 'quente_1_thank_you',
      subject: (ctx) => `✅ Seu Blueprint Técnico: ${ctx.blueprintTitle}`,
      htmlBody: (ctx) => generateQuente1Email(ctx),
      delayMinutes: 5  // Imediato
    },
    {
      id: 'quente_2',
      name: 'quente_2_case_study',
      subject: (ctx) => `Como empresas como ${ctx.companyName} reduziram custos`,
      htmlBody: (ctx) => generateQuente2Email(ctx),
      delayMinutes: 24 * 60  // 24h depois
    },
    {
      id: 'quente_3',
      name: 'quente_3_analysis',
      subject: (ctx) => `Sua análise técnica: ${ctx.blueprintTitle}`,
      htmlBody: (ctx) => generateQuente3Email(ctx),
      delayMinutes: 48 * 60  // 48h depois
    },
    {
      id: 'quente_4',
      name: 'quente_4_schedule',
      subject: (ctx) => `Confirmar discussão com especialista`,
      htmlBody: (ctx) => generateQuente4Email(ctx),
      delayMinutes: 72 * 60  // 72h depois
    }
  ],
  'acompanhando': [
    {
      id: 'acomp_1',
      name: 'acomp_1_interesting',
      subject: (ctx) => `Achamos sua situação muito interessante`,
      htmlBody: (ctx) => generateAcomp1Email(ctx),
      delayMinutes: 5
    },
    {
      id: 'acomp_2',
      name: 'acomp_2_case_study',
      subject: (ctx) => `Case: Empresa similar implementou em 30 dias`,
      htmlBody: (ctx) => generateAcomp2Email(ctx),
      delayMinutes: 3 * 24 * 60  // 3 dias
    },
    {
      id: 'acomp_3',
      name: 'acomp_3_cost_reduction',
      subject: (ctx) => `Reduzir custos operacionais: Guia prático`,
      htmlBody: (ctx) => generateAcomp3Email(ctx),
      delayMinutes: 7 * 24 * 60  // 7 dias
    },
    {
      id: 'acomp_4',
      name: 'acomp_4_offer',
      subject: (ctx) => `🎁 Aproveite 20% de desconto por tempo limitado`,
      htmlBody: (ctx) => generateAcomp4Email(ctx),
      delayMinutes: 14 * 24 * 60  // 14 dias
    }
  ],
  'morno': [
    {
      id: 'morno_1',
      name: 'morno_1_return',
      subject: (ctx) => `Vamos conversar quando quiser`,
      htmlBody: (ctx) => generateMorno1Email(ctx),
      delayMinutes: 5
    },
    {
      id: 'morno_2',
      name: 'morno_2_saved',
      subject: (ctx) => `Seu blueprint está salvo em nossa plataforma`,
      htmlBody: (ctx) => generateMorno2Email(ctx),
      delayMinutes: 7 * 24 * 60  // 7 dias
    },
    {
      id: 'morno_3',
      name: 'morno_3_ai_news',
      subject: (ctx) => `Novidades: IA já está transformando empresas`,
      htmlBody: (ctx) => generateMorno3Email(ctx),
      delayMinutes: 14 * 24 * 60  // 14 dias
    },
    {
      id: 'morno_4',
      name: 'morno_4_special_offer',
      subject: (ctx) => `Oferta especial: Consultoria gratuita de 1h`,
      htmlBody: (ctx) => generateMorno4Email(ctx),
      delayMinutes: 30 * 24 * 60  // 30 dias
    }
  ]
};

export async function startEmailSequence(
  leadId: string,
  leadStatus: LeadStatus,
  context: EmailContext
): Promise<void> {
  const templates = EMAIL_SEQUENCES[leadStatus];

  // Create email sequence record
  const { data, error } = await supabase
    .from('email_sequences')
    .insert([
      {
        lead_id: leadId,
        status: leadStatus,
        current_email_number: 0,
        next_send_at: new Date()
      }
    ])
    .select()
    .single();

  if (error) throw error;

  // Schedule first email immediately
  const firstTemplate = templates[0];
  await scheduleEmail(
    leadId,
    firstTemplate,
    context,
    new Date()
  );

  // Schedule remaining emails
  for (let i = 1; i < templates.length; i++) {
    const template = templates[i];
    const sendAt = new Date(Date.now() + template.delayMinutes * 60000);

    await scheduleEmail(
      leadId,
      template,
      context,
      sendAt
    );
  }
}

async function scheduleEmail(
  leadId: string,
  template: EmailTemplate,
  context: EmailContext,
  sendAt: Date
): Promise<void> {
  // Store email in queue to be picked up by cron job
  const { error } = await supabase
    .from('email_queue')
    .insert([
      {
        lead_id: leadId,
        template_id: template.id,
        template_name: template.name,
        scheduled_at: sendAt,
        context: context,
        sent: false
      }
    ]);

  if (error) throw error;
}
```

**Cron Job (Future - via Supabase):**

```typescript
// supabase/functions/process-email-queue/index.ts
// Executar a cada 5 minutos via Supabase Scheduler

serve(async (req) => {
  // Pegar todos os emails scheduled para agora
  const now = new Date();

  const { data: queuedEmails, error } = await supabase
    .from('email_queue')
    .select('*')
    .eq('sent', false)
    .lte('scheduled_at', now)
    .limit(100);

  if (error) throw error;

  for (const email of queuedEmails) {
    try {
      // Get template and context
      const template = EMAIL_SEQUENCES[email.context.leadStatus][email.index];

      // Render email
      const subject = template.subject(email.context);
      const html = template.htmlBody(email.context);

      // Send via Resend or SendGrid
      await sendEmail({
        to: email.context.leadEmail,
        subject,
        html,
        templateId: email.template_id
      });

      // Mark as sent
      await supabase
        .from('email_queue')
        .update({ sent: true, sent_at: now })
        .eq('id', email.id);

      // Log
      await supabase
        .from('email_logs')
        .insert([
          {
            lead_id: email.lead_id,
            email_type: email.template_name,
            recipient_email: email.context.leadEmail,
            sent_at: now
          }
        ]);
    } catch (err) {
      console.error(`Failed to send email ${email.id}:`, err);
      // Retry logic...
    }
  }
});
```

**Aceitação Criteria:**
- [ ] Email sequences iniciadas quando lead entra Fase 5
- [ ] Emails sendos nos horários corretos (cron)
- [ ] Conteúdo personalizado por lead status
- [ ] Email logs rastreiam envios/opens/clicks
- [ ] Teste: Simular múltiplos leads com status diferentes
- [ ] Teste: Verificar emails no inbox
- [ ] Unsubscribe link funciona

**Estimativa:** 4-5h | **Prioridade:** 🟡 ALTA

---

### 📋 Story 5.5: ADMIN DASHBOARD - LEAD PIPELINE & ANALYTICS

**Objetivo:** Dashboard admin para visualizar e gerenciar hot leads em tempo real

**Componentes:**

```
ADMIN DASHBOARD LAYOUT

┌─────────────────────────────────────────────────────────────┐
│ All Max Mind Admin Dashboard               [Aria Login v0]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📊 ANALYTICS OVERVIEW                                      │
│ ┌────────────────┬────────────────┬──────────────┐        │
│ │ Total Leads    │ Quentes Today  │ Conversion   │        │
│ │ 1,234          │ 45             │ 32.4%        │        │
│ └────────────────┴────────────────┴──────────────┘        │
│                                                             │
│ 🔥 HOT LEADS (Score >= 75)                                │
│ ┌──────────────────────────────────────────────┐           │
│ │ [Kanban Board View]                          │           │
│ │                                               │           │
│ │ TO CONTACT  │  IN CALL  │  SCHEDULED  │ DONE │           │
│ │ ──────────  │  ───────  │  ──────────  │ ──── │           │
│ │ [Card 1]    │ [Card 1]  │  [Card 1]   │      │           │
│ │ [Card 2]    │ [Card 2]  │  [Card 2]   │ [C1] │           │
│ │ [Card 3]    │           │             │ [C2] │           │
│ └──────────────────────────────────────────────┘           │
│                                                             │
│ 📈 SCORING ANALYTICS                                       │
│ ┌──────────────────────────────────────────────┐           │
│ │ [Bar Chart: Score Distribution]              │           │
│ │ Média: 72.5 | Min: 45 | Max: 98              │           │
│ │ [Line Chart: Score Over Time]                │           │
│ └──────────────────────────────────────────────┘           │
│                                                             │
│ 📧 EMAIL ENGAGEMENT                                        │
│ ┌──────────────────────────────────────────────┐           │
│ │ Sent: 234 | Opened: 156 (66%) | Clicked: 89 │           │
│ │ [Line chart de open rate por sequência]      │           │
│ └──────────────────────────────────────────────┘           │
│                                                             │
│ 💬 WHATSAPP INTEGRATION                                    │
│ ┌──────────────────────────────────────────────┐           │
│ │ Added: 67 | Messages: 234 | Response Rate: 34%│           │
│ └──────────────────────────────────────────────┘           │
│                                                             │
│ 📊 EXPORT & ACTIONS                                        │
│ [Export CSV] [Export to CRM] [Settings]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Database Schema:**

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50),  -- admin, manager, sales_rep
  supabase_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP
);

-- Views para analytics
CREATE VIEW lead_summary AS
SELECT
  COUNT(*) as total_leads,
  COUNT(CASE WHEN lead_status = 'quente' THEN 1 END) as hot_leads_count,
  COUNT(CASE WHEN lead_status = 'acompanhando' THEN 1 END) as warm_leads_count,
  COUNT(CASE WHEN lead_status = 'morno' THEN 1 END) as cold_leads_count,
  AVG(engagement_score) as avg_score,
  (COUNT(CASE WHEN lead_status = 'quente' THEN 1 END) * 100.0 / COUNT(*)) as conversion_pct
FROM leads
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

CREATE VIEW email_metrics AS
SELECT
  COUNT(*) as total_sent,
  COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened_count,
  COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked_count,
  (COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)) as open_rate,
  email_type,
  DATE(sent_at) as send_date
FROM email_logs
GROUP BY email_type, DATE(sent_at);
```

**Admin Components:**

```typescript
// src/components/admin/Dashboard.tsx
export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [summary, setSummary] = useState<LeadSummary | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    // Fetch leads
    const { data: leadsData } = await supabase
      .from('leads')
      .select('*')
      .eq('lead_status', 'quente')
      .order('engagement_score', { ascending: false });

    // Fetch summary
    const { data: summaryData } = await supabase
      .from('lead_summary')
      .select('*')
      .single();

    setLeads(leadsData || []);
    setSummary(summaryData);
  };

  return (
    <div className="admin-dashboard">
      <header>
        <h1>{t('admin.dashboard.title')}</h1>
        <button onClick={() => exportToCSV(leads)}>
          📥 {t('admin.export')}
        </button>
      </header>

      <div className="metrics-grid">
        <MetricCard label="Total Leads" value={summary?.total_leads} />
        <MetricCard label="Hot Leads" value={summary?.hot_leads_count} />
        <MetricCard label="Conversion %" value={summary?.conversion_pct} />
        <MetricCard label="Avg Score" value={summary?.avg_score} />
      </div>

      <div className="kanban-board">
        <KanbanColumn title="To Contact" leads={leads.filter(l => !l.contacted)} />
        <KanbanColumn title="In Call" leads={leads.filter(l => l.in_call)} />
        <KanbanColumn title="Scheduled" leads={leads.filter(l => l.scheduled_call)} />
        <KanbanColumn title="Done" leads={leads.filter(l => l.call_completed)} />
      </div>

      <div className="charts-grid">
        <ScoreDistributionChart leads={leads} />
        <EmailEngagementChart />
        <WhatsAppMetricsChart />
      </div>

      {/* Lead detail modal */}
      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
};

// src/components/admin/KanbanBoard.tsx
export const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, leads }) => {
  return (
    <div className="kanban-column">
      <h3>{title} ({leads.length})</h3>
      <div className="cards-container">
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
};

export const KanbanCard: React.FC<KanbanCardProps> = ({ lead }) => {
  return (
    <div className={`kanban-card score-${Math.floor(lead.engagement_score / 10)}`}>
      <div className="card-header">
        <h4>{lead.user_name}</h4>
        <span className="score-badge">{lead.engagement_score}%</span>
      </div>
      <div className="card-details">
        <p className="company">{lead.company_name}</p>
        <p className="email">{lead.user_email}</p>
        {lead.whatsapp_phone && (
          <p className="whatsapp">✓ {lead.whatsapp_phone}</p>
        )}
        {lead.scheduled_call && (
          <p className="call">📅 {lead.scheduled_call.toLocaleDateString()}</p>
        )}
      </div>
      <div className="card-actions">
        <button title="Call">📞</button>
        <button title="Email">✉️</button>
        <button title="WhatsApp">💬</button>
        <button title="More">⋮</button>
      </div>
    </div>
  );
};
```

**Aceitação Criteria:**
- [ ] Dashboard carrega todos os hot leads
- [ ] Kanban board funciona (drag & drop)
- [ ] Métricas atualizam em tempo real
- [ ] Charts renderizam corretamente
- [ ] Export para CSV funciona
- [ ] Filtros por status/score/data
- [ ] Mobile responsive (admin uses on mobile)
- [ ] Teste: +100 leads performance

**Estimativa:** 6-8h | **Prioridade:** 🟡 ALTA

---

## DATABASE SCHEMA COMPLETO

### Alterações necessárias (SQL Migrations):

```sql
-- Migration: 00013_phase5_fields_and_tables.sql

-- 1. Adicionar campos em leads para Fase 5
ALTER TABLE leads ADD COLUMN (
  feedback_score NUMERIC,                -- Step 1: 20-100
  budget_range VARCHAR(50),              -- Step 2: até_30k, 30_60k, 60_120k, 120k_plus
  project_timeline_estimated INT,        -- Step 3: dias
  prototype_commitment BOOLEAN,           -- Step 4: User confirmou
  scheduled_call TIMESTAMP,               -- Step 4: Data/hora
  whatsapp_phone VARCHAR(20),            -- Step 5: +55...
  whatsapp_added BOOLEAN DEFAULT FALSE,  -- Step 5
  whatsapp_message_id VARCHAR(255),      -- Message tracking
  whatsapp_template_used VARCHAR(50),    -- Template name
  phase5_started_at TIMESTAMP,
  phase5_completed_at TIMESTAMP,
  engagement_score NUMERIC DEFAULT 0,    -- 0-100
  in_call BOOLEAN DEFAULT FALSE,
  call_completed BOOLEAN DEFAULT FALSE,
  contacted_at TIMESTAMP
);

-- 2. Lead interactions tracking
CREATE TABLE lead_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50),  -- step1, step2, pdf_download, email_open, whatsapp_added
  step_number INT,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Email sequences
CREATE TABLE email_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  status VARCHAR(50),           -- quente, acompanhando, morno
  current_email_number INT,
  next_send_at TIMESTAMP,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 4. Email queue (para scheduling)
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id),
  template_id VARCHAR(255),
  template_name VARCHAR(255),
  scheduled_at TIMESTAMP,
  context JSONB,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP
);

-- 5. Email logs (histórico)
ALTER TABLE email_logs ADD COLUMN (
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced BOOLEAN DEFAULT FALSE,
  bounce_reason VARCHAR(255)
);

-- 6. Admin users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50),  -- admin, manager, sales_rep
  supabase_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP
);

-- 7. WhatsApp templates
CREATE TABLE whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE,
  template_name VARCHAR(255),
  language VARCHAR(10),
  parameters JSONB,
  created_at TIMESTAMP
);

-- 8. Índices para performance
CREATE INDEX idx_leads_engagement_score ON leads(engagement_score DESC);
CREATE INDEX idx_leads_phase5_started ON leads(phase5_started_at);
CREATE INDEX idx_leads_scheduled_call ON leads(scheduled_call);
CREATE INDEX idx_lead_interactions_lead_id ON lead_interactions(lead_id);
CREATE INDEX idx_lead_interactions_type ON lead_interactions(interaction_type);
CREATE INDEX idx_email_sequences_lead_id ON email_sequences(lead_id);
CREATE INDEX idx_email_sequences_status ON email_sequences(status);
CREATE INDEX idx_email_sequences_next_send ON email_sequences(next_send_at);
CREATE INDEX idx_email_queue_scheduled ON email_queue(scheduled_at);
CREATE INDEX idx_email_queue_sent ON email_queue(sent);

-- 9. Views para analytics
CREATE VIEW lead_summary AS
SELECT
  COUNT(*) as total_leads,
  COUNT(CASE WHEN lead_status = 'quente' THEN 1 END) as hot_leads_count,
  COUNT(CASE WHEN lead_status = 'acompanhando' THEN 1 END) as warm_leads_count,
  COUNT(CASE WHEN lead_status = 'morno' THEN 1 END) as cold_leads_count,
  AVG(engagement_score) as avg_score,
  ROUND((COUNT(CASE WHEN lead_status = 'quente' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 1) as conversion_pct
FROM leads
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

CREATE VIEW email_metrics AS
SELECT
  COUNT(*) as total_sent,
  COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened_count,
  COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked_count,
  ROUND((COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 1) as open_rate,
  email_type,
  DATE(sent_at) as send_date
FROM email_logs
WHERE sent_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY email_type, DATE(sent_at);

-- 10. RLS Policies (Admin)
CREATE POLICY "Admins can view all leads" ON leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.supabase_id = auth.uid()
      AND admin_users.is_active = TRUE
    )
  );
```

---

## API CONTRACTS

### Edge Functions

#### `/functions/generate-blueprint-pdf` (Sprint 3)

```
POST /functions/generate-blueprint-pdf
Content-Type: application/json

Request:
{
  "blueprint": { /* Blueprint object */ },
  "problemStatement": "string",
  "includeEmail": false  // future: send immediately
}

Response:
{
  "success": true,
  "pdfUrl": "https://...",
  "fileSize": 245000,
  "generatedAt": "2026-02-01T14:30:00Z"
}

Errors:
- 400: Invalid blueprint
- 500: PDF generation failed
```

#### `/functions/add-to-whatsapp-group` (Story 5.3)

```
POST /functions/add-to-whatsapp-group
Content-Type: application/json

Request:
{
  "leadId": "uuid",
  "phone": "+5511999999999",
  "leadName": "João Silva",
  "companyName": "Tech Corp"
}

Response:
{
  "success": true,
  "messageId": "wamid.xxx",
  "message": "Lead added to WhatsApp successfully"
}

Errors:
- 400: Invalid phone format
- 429: Rate limit (WhatsApp limits)
- 500: API error
```

#### `/functions/process-email-queue` (Story 5.4 - Cron)

```
GET /functions/process-email-queue
Authorization: Bearer SERVICE_ROLE_KEY

Runs every 5 minutes via Supabase Scheduler

Response:
{
  "processed": 45,
  "failed": 2,
  "skipped": 10,
  "errors": [...]
}
```

#### `/functions/update-lead-score` (Story 5.2)

```
POST /functions/update-lead-score
Content-Type: application/json

Request:
{
  "leadId": "uuid",
  "inputs": {
    "feedbackScore": 100,
    "budgetRange": "60_120k",
    "timeline": 30,
    "callScheduled": true,
    "whatsappAdded": true
  }
}

Response:
{
  "success": true,
  "score": 85,
  "status": "quente",
  "previousScore": 50,
  "previousStatus": "acompanhando"
}
```

---

## COMPONENTES REACT

### Estrutura de Componentes (Phase 5):

```
src/components/phases/Phase5/
├── Phase5.tsx                    (Main orchestrator)
├── steps/
│   ├── Step1_Feedback.tsx
│   ├── Step2_Budget.tsx
│   ├── Step3_Timeline.tsx
│   ├── Step4_Schedule.tsx
│   └── Step5_WhatsApp.tsx
├── common/
│   ├── ProgressBar.tsx
│   ├── StepCard.tsx
│   └── ErrorCard.tsx
└── hooks/
    ├── usePhase5State.ts
    └── useLeadScoring.ts

src/components/admin/
├── Dashboard.tsx
├── KanbanBoard.tsx
├── KanbanCard.tsx
├── LeadDetailModal.tsx
├── charts/
│   ├── ScoreDistributionChart.tsx
│   ├── EmailEngagementChart.tsx
│   └── WhatsAppMetricsChart.tsx
└── filters/
    ├── LeadFilter.tsx
    └── DateRangeFilter.tsx
```

---

## LEAD SCORING SYSTEM (HYBRID)

### Fórmula Híbrida:

```
FASE 4 (Heuristic):
  Base Score = 50
  + 10 (corporate email)
  + 15 (senior job title)
  + 10 (company provided)
  = 50-85

FASE 5 (Dynamic):
  Step 1: feedbackScore (20-100) replaces base
  Step 2: + budgetRange (10-40)
  Step 3: + timeline (5-30)
  Step 4: + callScheduled (30 bonus)
  Step 5: + whatsappAdded (10 bonus)
  = 50-100 (normalized)

FUTURE (Sprint 5 - ML):
  ML Score = 0.6 * DynamicScore + 0.3 * InteractionScore + 0.1 * TimelineScore
  - DynamicScore: Atual (50-100)
  - InteractionScore: Baseado em email opens, clicks, WhatsApp messages
  - TimelineScore: Baseado em velocidade de progression
  - Accuracy target: 85%+
```

---

## WHATSAPP BUSINESS API INTEGRATION

### Setup Checklist:

```
1. Business Account Setup
   [ ] Create Meta Business Account
   [ ] Create WhatsApp Business App
   [ ] Get Phone Number ID
   [ ] Get Business Account ID
   [ ] Generate Access Token (24h expiry)

2. Supabase Configuration
   [ ] Store WHATSAPP_PHONE_NUMBER_ID in secrets
   [ ] Store WHATSAPP_BUSINESS_ACCOUNT_ID in secrets
   [ ] Store WHATSAPP_API_TOKEN in secrets
   [ ] Setup env vars in .env.local

3. Message Templates
   [ ] Create "lead_welcome" template (pt_BR)
   [ ] Create "blueprint_delivery" template
   [ ] Create "call_reminder" template
   [ ] Test in Meta Dashboard

4. Webhooks (Future - Sprint 5)
   [ ] Setup webhook for message events
   [ ] Handle incoming messages
   [ ] Track delivery status
   [ ] Track message read receipts

5. Testing
   [ ] Test message sending
   [ ] Test with multiple phone numbers
   [ ] Monitor delivery rate
   [ ] Check rate limits (1000 msg/day default)
```

---

## ADMIN DASHBOARD ARCHITECTURE

### Key Metrics Tracked:

```
REAL-TIME METRICS
├── Total Leads Today
├── Hot Leads (Quentes)
├── Avg Lead Score
└── Conversion Rate (%)

EMAIL ANALYTICS
├── Sent (24h, 7d, 30d)
├── Open Rate
├── Click Rate
├── Bounce Rate
└── Top Performing Templates

WHATSAPP METRICS
├── Leads Added
├── Messages Sent
├── Delivery Rate
├── Response Rate

LEAD PIPELINE
├── To Contact (hot leads not yet contacted)
├── In Call (scheduled calls in progress)
├── Scheduled (calls scheduled)
└── Done (converted)

SCORING ANALYTICS
├── Score Distribution (histogram)
├── Score Trends (line chart)
├── Feedback Score Impact
└── Budget/Timeline Impact
```

---

## PERFORMANCE & MONITORING

### Performance Targets:

```
Phase 5 Component Load: < 2s
Step Rendering: < 500ms
Lead Score Calculation: < 100ms
Email Sending (async): < 5s per email
WhatsApp API Call: < 3s
Admin Dashboard Load: < 3s
Admin Kanban Render: < 1s (100 leads)

Uptime Target: 99.9%
Error Rate Target: < 0.5%
Database Query P95: < 200ms
```

### Monitoring Setup:

```
Sentry Events:
├── score_calculation_error
├── email_send_failure
├── whatsapp_api_error
├── phase5_step_error
└── admin_dashboard_error

Google Analytics Events:
├── phase5_step1_start
├── phase5_step1_complete
├── ... (for each step)
├── phase5_complete
├── lead_status_changed
├── email_sent
├── whatsapp_added

Database Monitoring:
├── Slow queries (> 1000ms)
├── Connection pool usage
├── Storage usage
└── RLS policy violations
```

---

## DEPLOYMENT & GO-LIVE

### Pre-Launch Checklist:

```
DEVELOPMENT (Week 1-2)
[ ] All stories coded
[ ] Unit tests passing (npm test)
[ ] Linting passing (npm run lint)
[ ] TypeScript compiling (npm run typecheck)
[ ] Local testing complete

STAGING (Week 3)
[ ] Deploy to staging environment
[ ] End-to-end testing
[ ] Performance testing (load test)
[ ] Security review (OWASP, credentials)
[ ] Database backup/restore testing
[ ] Email template final review
[ ] WhatsApp template approval

PRODUCTION (Week 4)
[ ] Final code review
[ ] Deployment checklist
[ ] Database migration (with rollback plan)
[ ] Monitoring setup verified
[ ] On-call schedule setup
[ ] Customer communication drafted
[ ] Rollback plan documented

LAUNCH WEEK
[ ] Canary deployment (10% traffic)
[ ] Monitor error rate, performance
[ ] Gradual ramp (25% → 50% → 100%)
[ ] Customer announcements
[ ] Support training

POST-LAUNCH (Week 5+)
[ ] Monitor analytics
[ ] Optimize scoring model
[ ] A/B test email sequences
[ ] Gather user feedback
[ ] Plan Sprint 5 features
```

### Rollback Plan:

```
If P0 Issue Found:
1. Revert Phase5 feature flag (kill switch)
2. Revert to previous version (if needed)
3. Debug in staging
4. Fix and re-test
5. Roll forward with fix

Database Rollback:
1. Have backup from before migration
2. Restore from backup
3. Re-apply migrations
4. Verify data integrity
```

---

## 🎯 RESUMO EXECUTIVO FINAL

### O Que Estamos Construindo

**Fase 5: Hot Lead Conversion System** - Um funil inteligente que:

1. ✅ **Fase 4 (Final)** - Lead capturado com blueprint
2. ✅ **Fase 5 MVP (Sprint 4)** - 5 passos engajamento
   - Feedback score refinado
   - Budget & timeline capture
   - Call scheduling
   - WhatsApp Business API
   - Lead scoring híbrido (heuristic + dinâmico)
3. ✅ **Fase 5 Enterprise (Sprint 5+)** - Full automation
   - Email sequences automáticas
   - ML-based scoring
   - Admin dashboard com analytics
   - CRM integrations

### Timeline & Effort

| Sprint | Tarefas | Esforço | Foco |
|--------|---------|---------|------|
| **Sprint 3** | 3.3-3.6 (Fixes) | 13-18h | Remove mock, PDF, OpenAI, Tradução |
| **Sprint 4** | 5.1-5.5 (Phase 5 MVP) | 18-24h | Multi-step, scoring, WhatsApp |
| **Sprint 5+** | Enterprise features | 16-20h | Automation, ML, Admin, CRM |

### Expected Outcomes

```
BEFORE
├── Leads capturados: 100%
├── Leads que voltam: ~5%
├── Conversão: ~8-12%
└── Admin visibility: Nenhuma

AFTER (Sprint 4)
├── Leads em Fase 5: 80%
├── Leads completam sequência: 45-50%
├── Leads quentes: 35-45%
├── Conversão: 25-30%
└── Admin dashboard: Basic

AFTER (Sprint 5)
├── Leads com multi-touch: 90%+
├── ML score accuracy: 85%+
├── Email open rate: 40-50%
├── Conversão: 40-50%+
└── Admin dashboard: Full analytics
```

---

**Documento preparado por:** Aria (Architect) + Pax (PO)
**Data de Criação:** 30/01/2026
**Última Atualização:** 30/01/2026
**Status:** ✅ Pronto para Implementação (Sprint 3)

---

**PRÓXIMOS PASSOS:**

1. ✅ Compartilhar este plano com @dev para feedback de implementação
2. ✅ Começar Sprint 3 (Stories 3.3-3.6)
3. ✅ Setup de WhatsApp Business API (meta.com)
4. ✅ Planejamento detalhado de Sprint 4 (Stories 5.1-5.5)

